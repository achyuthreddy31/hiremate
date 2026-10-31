import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cleanStaleJobsOnStartup,
  cancelWorkflow,
  executeGenerationWorkflow
} from '../src/services/workflow.service.js';
import { GenerationJob } from '../src/models/generationJob.model.js';
import { Application } from '../src/models/application.model.js';
import { startServer } from '../src/server.js';
import * as dbConfig from '../src/config/db.js';

describe('Phase 1C: Background Workflow Reliability & Lifecycle Tests', () => {
  describe('Startup Stale Job Cleanup', () => {
    it('cleans orphaned in-flight jobs and marks their processing stages as failed with recovery info', async () => {
      const mockStaleDate = new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago

      const updateManySpy = vi.spyOn(GenerationJob, 'updateMany').mockResolvedValueOnce({
        acknowledged: true,
        modifiedCount: 3
      });

      const result = await cleanStaleJobsOnStartup({ thresholdMinutes: 10 });

      expect(result.success).toBe(true);
      expect(result.cleanedCount).toBe(3);
      expect(updateManySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processing',
          updatedAt: expect.any(Object)
        }),
        expect.objectContaining({
          $set: expect.objectContaining({
            status: 'failed',
            'stages.$[elem].status': 'failed',
            'stages.$[elem].error': expect.stringContaining('Job interrupted')
          })
        }),
        expect.objectContaining({
          arrayFilters: [{ 'elem.status': 'processing' }]
        })
      );

      updateManySpy.mockRestore();
    });

    it('safely handles cleanup errors without throwing or crashing server initialization', async () => {
      const updateManySpy = vi.spyOn(GenerationJob, 'updateMany').mockRejectedValueOnce(
        new Error('Database connectivity interrupted')
      );

      const result = await cleanStaleJobsOnStartup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database connectivity interrupted');

      updateManySpy.mockRestore();
    });
  });

  describe('Workflow Cancellation & Terminal States', () => {
    it('transitions active workflow and its unfinished stages to cancelled state', async () => {
      const mockJob = {
        _id: 'job_cancel_1',
        firebaseUid: 'user_cancel',
        status: 'processing',
        stages: [
          { name: 'validate_input', status: 'completed' },
          { name: 'analyze_job', status: 'processing' },
          { name: 'generate_roadmap', status: 'pending' }
        ],
        save: vi.fn().mockResolvedValue(true)
      };

      const findOneSpy = vi.spyOn(GenerationJob, 'findOne').mockResolvedValueOnce(mockJob);

      const result = await cancelWorkflow('job_cancel_1', 'user_cancel');

      expect(result.status).toBe('cancelled');
      expect(mockJob.stages[0].status).toBe('completed'); // Preserves already completed
      expect(mockJob.stages[1].status).toBe('cancelled'); // Cancels active
      expect(mockJob.stages[2].status).toBe('cancelled'); // Cancels pending
      expect(mockJob.save).toHaveBeenCalled();

      findOneSpy.mockRestore();
    });

    it('does not mutate already completed terminal jobs during cancellation attempt', async () => {
      const completedJob = {
        _id: 'job_comp_1',
        firebaseUid: 'user_cancel',
        status: 'completed',
        stages: [{ name: 'validate_input', status: 'completed' }],
        save: vi.fn()
      };

      const findOneSpy = vi.spyOn(GenerationJob, 'findOne').mockResolvedValueOnce(completedJob);

      const result = await cancelWorkflow('job_comp_1', 'user_cancel');

      expect(result.status).toBe('completed');
      expect(completedJob.save).not.toHaveBeenCalled();

      findOneSpy.mockRestore();
    });
  });

  describe('Concurrency & Duplicate Execution Guard', () => {
    it('uses atomic findOneAndUpdate to prevent duplicate concurrent executions of the same job', async () => {
      // Simulate atomic lock already acquired (returns null)
      const findOneAndUpdateSpy = vi.spyOn(GenerationJob, 'findOneAndUpdate').mockResolvedValueOnce(null);

      await executeGenerationWorkflow('job_already_processing');

      expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
        { _id: 'job_already_processing', status: { $ne: 'processing' } },
        expect.objectContaining({ $set: expect.objectContaining({ status: 'processing' }) }),
        { new: true }
      );

      findOneAndUpdateSpy.mockRestore();
    });
  });

  describe('Database Connection Handling on Startup', () => {
    it('catches database connection errors during startup safely', async () => {
      const connectDBSpy = vi.spyOn(dbConfig, 'connectDB').mockResolvedValueOnce(null);

      // In non-production test mode, connectDB returning null does not throw
      const serverInstance = await startServer(0);
      expect(serverInstance).toBeDefined();
      if (serverInstance && typeof serverInstance.close === 'function') {
        await new Promise((resolve) => serverInstance.close(resolve));
      }

      connectDBSpy.mockRestore();
    });
  });
});
