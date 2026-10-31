import { User } from '../models/user.model.js';
import { performCompleteAccountDeletion } from '../services/accountDeletion.service.js';

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
    const result = await performCompleteAccountDeletion(uid);

    return res.status(200).json({
      success: true,
      data: {
        message: 'All user account data deleted successfully across all associated collections.',
        summary: result.deletionSummary,
        totalDeleted: result.totalDeleted
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'ACCOUNT_DELETE_ERROR', message: error.message }
    });
  }
}
