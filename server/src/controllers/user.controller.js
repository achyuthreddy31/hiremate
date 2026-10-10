import { User } from '../models/user.model.js';
import { Application } from '../models/application.model.js';

export async function getProfile(req, res) {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(200).json({
        success: true,
        data: {
          firebaseUid: req.user.uid,
          email: req.user.email,
          name: '',
          skills: [],
          experience: [],
          projects: [],
          education: [],
          isNewUser: true
        }
      });
    }
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_FETCH_ERROR', message: error.message }
    });
  }
}

export async function upsertProfile(req, res) {
  try {
    const profileData = {
      ...req.body,
      firebaseUid: req.user.uid,
      email: req.user.email || req.body.email
    };

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PROFILE_UPDATE_ERROR', message: error.message }
    });
  }
}

export async function deleteAccount(req, res) {
  try {
    const uid = req.user.uid;
    // Find all applications to cascade delete related models
    const apps = await Application.find({ firebaseUid: uid });
    const appIds = apps.map(a => a._id);

    // Delete all user documents across all collections
    await User.deleteMany({ firebaseUid: uid });
    await Application.deleteMany({ firebaseUid: uid });

    return res.status(200).json({
      success: true,
      data: { message: 'All user account data deleted successfully.' }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'ACCOUNT_DELETE_ERROR', message: error.message }
    });
  }
}
