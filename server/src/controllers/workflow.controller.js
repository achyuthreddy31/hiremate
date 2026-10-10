import { WORKFLOW_STAGES } from '../../../shared/constants.js';
import { GenerationJob } from '../models/generationJob.model.js';
import { Application } from '../models/application.model.js';
import { executeGenerationWorkflow } from '../services/workflow.service.js';

export async function startOrResumeWorkflow(req, res) {
  try {
    const { applicationId } = req.params;
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

    // Find existing job to resume (if failed), or create fresh job
    let job = await GenerationJob.findOne({ applicationId, firebaseUid: req.user.uid });

    if (!job) {
      const initialStages = WORKFLOW_STAGES.map(name => ({
        name,
        status: 'pending',
        error: null,
        retries: 0
      }));

      job = new GenerationJob({
        firebaseUid: req.user.uid,
        applicationId,
        idempotencyKey,
        stages: initialStages,
        status: 'pending',
        currentStage: WORKFLOW_STAGES[0],
        progress: 0
      });
      await job.save();
    } else if (job.status === 'failed') {
      // Resume failed job: reset failed stages to pending
      for (const st of job.stages) {
        if (st.status === 'failed') {
          st.status = 'pending';
          st.error = null;
        }
      }
      job.status = 'pending';
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
    const job = await GenerationJob.findOne({ applicationId, firebaseUid: req.user.uid });

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
