import { WORKFLOW_STAGES } from '../../../shared/constants.js';
import { GenerationJob } from '../models/generationJob.model.js';
import { Application } from '../models/application.model.js';
import { executeGenerationWorkflow, cancelWorkflow } from '../services/workflow.service.js';

export async function startOrResumeWorkflow(req, res) {
  try {
    const { applicationId } = req.params;
    const forceRerun = req.body?.rerun === true || req.query?.rerun === 'true';
    const idempotencyKey = req.headers['idempotency-key'] || `${applicationId}_${Date.now()}`;

    // Verify application ownership
    const app = await Application.findOne({ _id: applicationId, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    // Check if there is already an active job running for this application
    const activeJob = await GenerationJob.findOne({
      applicationId,
      firebaseUid: req.user.uid,
      status: { $in: ['pending', 'processing'] }
    });

    if (activeJob) {
      return res.status(200).json({
        success: true,
        data: activeJob,
        message: 'A workflow is already active for this application.'
      });
    }

    // Find the latest job for this application to determine if we should resume or regenerate
    const latestJob = await GenerationJob.findOne({
      applicationId,
      firebaseUid: req.user.uid
    }).sort({ createdAt: -1 });

    let job = null;

    // If a failed job exists and user did not explicitly request a fresh rerun, resume it
    if (latestJob && latestJob.status === 'failed' && !forceRerun) {
      job = latestJob;
      for (const st of job.stages) {
        if (st.status === 'failed') {
          st.status = 'pending';
          st.error = null;
        }
      }
      job.status = 'pending';
      await job.save();
    } else {
      // Create a fresh workflow run (for first run, rerun of completed, or forced rerun)
      const initialStages = WORKFLOW_STAGES.map(name => ({
        name,
        status: 'pending',
        error: null,
        retries: 0
      }));

      const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      job = new GenerationJob({
        firebaseUid: req.user.uid,
        applicationId,
        runId,
        idempotencyKey,
        stages: initialStages,
        status: 'pending',
        currentStage: WORKFLOW_STAGES[0],
        progress: 0
      });
      await job.save();
    }

    // Run in background asynchronously (client polls for progress)
    executeGenerationWorkflow(job._id).catch(err => {
      console.error('Background workflow execution error:', err);
    });

    return res.status(202).json({
      success: true,
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'WORKFLOW_START_ERROR', message: error.message }
    });
  }
}

export async function getWorkflowStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const job = await GenerationJob.findOne({
      applicationId,
      firebaseUid: req.user.uid
    }).sort({ createdAt: -1 });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: { code: 'NO_WORKFLOW_FOUND', message: 'No workflow found for this application.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function cancelWorkflowHandler(req, res) {
  try {
    const { applicationId } = req.params;
    const activeJob = await GenerationJob.findOne({
      applicationId,
      firebaseUid: req.user.uid,
      status: { $in: ['pending', 'processing'] }
    }).sort({ createdAt: -1 });

    if (!activeJob) {
      return res.status(404).json({
        success: false,
        error: { code: 'NO_ACTIVE_WORKFLOW', message: 'No active workflow to cancel.' }
      });
    }

    const cancelled = await cancelWorkflow(activeJob._id, req.user.uid);

    return res.status(200).json({
      success: true,
      data: cancelled,
      message: 'Workflow successfully cancelled.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'WORKFLOW_CANCEL_ERROR', message: error.message }
    });
  }
}
