import { Application } from '../models/application.model.js';
import { USER_DEPENDENT_MODELS } from '../services/accountDeletion.service.js';
import mongoose from 'mongoose';

export async function getApplications(req, res) {
  try {
    const apps = await Application.find({ firebaseUid: req.user.uid }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: apps
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'APPS_FETCH_ERROR', message: error.message }
    });
  }
}

export async function createApplication(req, res) {
  try {
    const app = new Application({
      ...req.body,
      firebaseUid: req.user.uid
    });
    await app.save();

    return res.status(201).json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'APP_CREATE_ERROR', message: error.message }
    });
  }
}

export async function getApplicationById(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid application ID format' }
      });
    }

    const app = await Application.findOne({ _id: id, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    return res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'APP_FETCH_ERROR', message: error.message }
    });
  }
}

export async function updateApplication(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid application ID format' }
      });
    }

    const app = await Application.findOneAndUpdate(
      { _id: id, firebaseUid: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    return res.status(200).json({
      success: true,
      data: app
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'APP_UPDATE_ERROR', message: error.message }
    });
  }
}

export async function deleteApplication(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid application ID format' }
      });
    }

    const app = await Application.findOneAndDelete({ _id: id, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    // Cascade delete across all 13 application-linked models directly
    for (const { model } of USER_DEPENDENT_MODELS) {
      await model.deleteMany({ applicationId: id, firebaseUid: req.user.uid });
    }

    return res.status(200).json({
      success: true,
      data: { message: 'Application and associated records deleted successfully.' }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'APP_DELETE_ERROR', message: error.message }
    });
  }
}
