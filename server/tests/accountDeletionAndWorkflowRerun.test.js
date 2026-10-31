import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { performCompleteAccountDeletion, USER_DEPENDENT_MODELS } from '../src/services/accountDeletion.service.js';
import { User } from '../src/models/user.model.js';
import { Application } from '../src/models/application.model.js';
import { GenerationJob } from '../src/models/generationJob.model.js';
import { startOrResumeWorkflow } from '../src/controllers/workflow.controller.js';

describe('Phase 2: Database Deletion & Workflow Regeneration Tests', () => {
  let dependentSpies = [];
  let userSpy;
  let appSpy;

  beforeEach(() => {
    dependentSpies = USER_DEPENDENT_MODELS.map(({ name, model }) => {
      return {
        name,
        spy: vi.spyOn(model, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 2 })
      };
    });
    userSpy = vi.spyOn(User, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    appSpy = vi.spyOn(Application, 'deleteMany').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
  });

  afterEach(() => {
    dependentSpies.forEach(({ spy }) => spy.mockRestore());
    userSpy?.mockRestore();
    appSpy?.mockRestore();
  });

  describe('Complete Account Deletion Across All Associated Collections', () => {
    it('deletes user data from User, Application, and all 13 dependent collections in correct order', async () => {
      const targetUid = 'user_to_delete_123';

      const result = await performCompleteAccountDeletion(targetUid);

      expect(result.success).toBe(true);
      expect(result.firebaseUid).toBe(targetUid);
      expect(result.totalDeleted).toBe(2 * 13 + 1 + 1); // 26 dependent + 1 app + 1 user = 28

      for (const { spy } of dependentSpies) {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ firebaseUid: targetUid }),
          expect.anything()
        );
      }

      expect(appSpy).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: targetUid }), expect.anything());
      expect(userSpy).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: targetUid }), expect.anything());
    });

    it('enforces strict user isolation: User A deletion does not affect User B records', async () => {
      const userAUid = 'user_A_isolated';
      const userBUid = 'user_B_isolated';

      const result = await performCompleteAccountDeletion(userAUid);
      expect(result.success).toBe(true);
      expect(result.firebaseUid).toBe(userAUid);

      for (const { spy } of dependentSpies) {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ firebaseUid: userAUid }),
          expect.anything()
        );
        // Guarantee user B's UID was never passed
        expect(spy).not.toHaveBeenCalledWith(
          expect.objectContaining({ firebaseUid: userBUid }),
          expect.anything()
        );
      }

      expect(appSpy).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: userAUid }), expect.anything());
      expect(userSpy).toHaveBeenCalledWith(expect.objectContaining({ firebaseUid: userAUid }), expect.anything());
    });

    it('rejects deletion if firebaseUid is missing', async () => {
      await expect(performCompleteAccountDeletion(null)).rejects.toThrow('firebaseUid is required');
      await expect(performCompleteAccountDeletion('')).rejects.toThrow('firebaseUid is required');
    });
  });

  describe('Workflow Regeneration & Repeated Runs', () => {
    it('creates a fresh workflow run with unique runId when starting after a completed run', async () => {
      const completedJob = {
        _id: '507f1f77bcf86cd799439011',
        runId: 'run_old_completed',
        status: 'completed',
        progress: 100,
        stages: [{ name: 'validate_input', status: 'completed' }]
      };

      const findAppSpy = vi.spyOn(Application, 'findOne').mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439012', firebaseUid: 'user_1' });
      
      const findJobSpy = vi.spyOn(GenerationJob, 'findOne')
        .mockResolvedValueOnce(null) // 1. activeJob is null
        .mockReturnValueOnce({
          sort: vi.fn().mockResolvedValue(completedJob) // 2. latestJob is completedJob
        });

      let savedJobInstance = null;
      const saveSpy = vi.spyOn(GenerationJob.prototype, 'save').mockImplementation(function() {
        savedJobInstance = this;
        return Promise.resolve(this);
      });

      const req = {
        params: { applicationId: '507f1f77bcf86cd799439012' },
        user: { uid: 'user_1' },
        headers: {},
        body: {}
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => data)
      };

      await startOrResumeWorkflow(req, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(savedJobInstance).toBeDefined();
      expect(savedJobInstance.status).toBe('pending');
      expect(savedJobInstance.progress).toBe(0);
      expect(savedJobInstance.runId).toMatch(/^run_/);
      expect(savedJobInstance.runId).not.toBe(completedJob.runId);

      findAppSpy.mockRestore();
      findJobSpy.mockRestore();
      saveSpy.mockRestore();
    });

    it('returns the existing active workflow when a job is already in progress without duplicating execution', async () => {
      const activeJob = {
        _id: '507f1f77bcf86cd799439013',
        status: 'processing',
        currentStage: 'analyze_job',
        progress: 30
      };

      const findAppSpy = vi.spyOn(Application, 'findOne').mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439012', firebaseUid: 'user_1' });
      const findActiveSpy = vi.spyOn(GenerationJob, 'findOne').mockResolvedValueOnce(activeJob);

      const req = {
        params: { applicationId: '507f1f77bcf86cd799439012' },
        user: { uid: 'user_1' },
        headers: {},
        body: {}
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => data)
      };

      await startOrResumeWorkflow(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: activeJob,
        message: 'A workflow is already active for this application.'
      }));

      findAppSpy.mockRestore();
      findActiveSpy.mockRestore();
    });

    it('resumes failed stages of an existing failed job rather than discarding prior successful work', async () => {
      const failedJob = {
        _id: '507f1f77bcf86cd799439014',
        runId: 'run_failed_123',
        status: 'failed',
        stages: [
          { name: 'validate_input', status: 'completed', error: null },
          { name: 'analyze_job', status: 'failed', error: 'Transient network glitch' },
          { name: 'generate_roadmap', status: 'pending', error: null }
        ],
        save: vi.fn().mockResolvedValue(true)
      };

      const findAppSpy = vi.spyOn(Application, 'findOne').mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439012', firebaseUid: 'user_1' });
      
      const findJobSpy = vi.spyOn(GenerationJob, 'findOne')
        .mockResolvedValueOnce(null)
        .mockReturnValueOnce({
          sort: vi.fn().mockResolvedValue(failedJob)
        });

      const req = {
        params: { applicationId: '507f1f77bcf86cd799439012' },
        user: { uid: 'user_1' },
        headers: {},
        body: {}
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => data)
      };

      await startOrResumeWorkflow(req, res);

      expect(res.status).toHaveBeenCalledWith(202);
      expect(failedJob.status).toBe('pending');
      expect(failedJob.stages[0].status).toBe('completed');
      expect(failedJob.stages[1].status).toBe('pending');
      expect(failedJob.stages[1].error).toBeNull();
      expect(failedJob.save).toHaveBeenCalled();

      findAppSpy.mockRestore();
      findJobSpy.mockRestore();
    });
  });
});
