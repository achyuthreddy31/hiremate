import mongoose from 'mongoose';
import { Resume } from '../models/resume.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { User } from '../models/user.model.js';
import { Application } from '../models/application.model.js';
import { validatePdfSignature } from '../middleware/upload.middleware.js';
import { extractTextFromPdf, analyzeResumeQuality, parseResumeFields } from '../services/resume.service.js';
import { calculateCandidateExperienceYears } from '../services/scoring/jobMatchScore.js';

export async function uploadAndParseResume(req, res) {
  try {
    const { applicationId } = req.body;
    if (!applicationId || !mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_APP_ID', message: 'Valid applicationId is required' }
      });
    }

    // Verify application ownership
    const app = await Application.findOne({ _id: applicationId, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No PDF resume file uploaded' }
      });
    }

    // Magic bytes signature check
    if (!validatePdfSignature(req.file.buffer)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Uploaded file is not a valid PDF (%PDF- header missing)' }
      });
    }

    // In-memory text extraction
    let extracted;
    try {
      extracted = await extractTextFromPdf(req.file.buffer);
    } catch (parseErr) {
      return res.status(422).json({
        success: false,
        error: { code: 'PDF_PARSE_FAILED', message: parseErr.message }
      });
    }

    const { text } = extracted;
    const qualityResult = analyzeResumeQuality(text);
    const parsedData = parseResumeFields(text);

    // Save or update Resume document
    const resume = await Resume.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        firebaseUid: req.user.uid,
        applicationId,
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        extractedText: text,
        parsedData,
        parsingStatus: 'completed',
        qualityChecklist: qualityResult.checklist
      },
      { new: true, upsert: true }
    );

    // Update or build CandidateProfile
    await syncCandidateProfile(req.user.uid, applicationId, parsedData);

    return res.status(200).json({
      success: true,
      data: {
        resumeId: resume._id,
        filename: resume.originalFilename,
        status: resume.parsingStatus,
        qualityScore: qualityResult.score,
        qualityBreakdown: qualityResult.breakdown,
        qualityChecklist: qualityResult.checklist,
        parsedData: resume.parsedData
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESUME_UPLOAD_ERROR', message: error.message }
    });
  }
}

export async function getResumeData(req, res) {
  try {
    const { applicationId } = req.params;
    const resume = await Resume.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'No resume uploaded for this application' }
      });
    }

    return res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESUME_FETCH_ERROR', message: error.message }
    });
  }
}

export async function updateResumeData(req, res) {
  try {
    const { applicationId } = req.params;
    const { parsedData } = req.body;

    // Mark updated fields as userVerified
    if (parsedData.skills) {
      parsedData.skills.forEach(s => { s.userVerified = true; });
    }

    const resume = await Resume.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      { parsedData },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: { code: 'RESUME_NOT_FOUND', message: 'Resume not found' }
      });
    }

    // Sync updated data to CandidateProfile (userVerified edits win)
    await syncCandidateProfile(req.user.uid, applicationId, parsedData);

    return res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESUME_UPDATE_ERROR', message: error.message }
    });
  }
}

/**
 * Builds or updates the single CandidateProfile per application.
 * Merges User profile and parsed Resume (userVerified edits win).
 */
export async function syncCandidateProfile(firebaseUid, applicationId, resumeParsedData) {
  const isObjId = mongoose.Types.ObjectId.isValid(firebaseUid);
  const user = await User.findOne({
    $or: [
      { firebaseUid },
      ...(isObjId ? [{ _id: firebaseUid }] : [])
    ]
  });

  const existingProfile = await CandidateProfile.findOne({ applicationId, firebaseUid });

  const skillsMap = new Map();

  // 1. Preserve existing user-verified skills first
  if (existingProfile && Array.isArray(existingProfile.skills)) {
    for (const s of existingProfile.skills) {
      if (s.userVerified) {
        const key = (s.normalizedName || s.name).toLowerCase();
        skillsMap.set(key, {
          name: s.name,
          normalizedName: s.normalizedName || s.name,
          category: s.category || 'other',
          source: s.source || 'profile',
          userVerified: true
        });
      }
    }
  }

  // 2. Add skills from base user profile
  if (user && Array.isArray(user.skills)) {
    for (const skillName of user.skills) {
      const key = skillName.toLowerCase();
      if (!skillsMap.has(key)) {
        skillsMap.set(key, {
          name: skillName,
          normalizedName: skillName,
          category: 'other',
          source: 'profile',
          userVerified: true
        });
      }
    }
  }

  // 3. Add skills from resume (userVerified wins if duplicate)
  if (resumeParsedData && Array.isArray(resumeParsedData.skills)) {
    for (const s of resumeParsedData.skills) {
      const key = (s.normalizedName || s.name).toLowerCase();
      const existing = skillsMap.get(key);
      if (!existing || (!existing.userVerified && s.userVerified)) {
        skillsMap.set(key, {
          name: s.name,
          normalizedName: s.normalizedName || s.name,
          category: s.category || 'other',
          source: 'resume',
          userVerified: Boolean(s.userVerified)
        });
      }
    }
  }

  // Consolidate experience & calculate total years without dropping user-verified data
  const experienceList = (resumeParsedData?.experience && resumeParsedData.experience.length > 0)
    ? resumeParsedData.experience
    : (existingProfile?.experience && existingProfile.experience.length > 0)
      ? existingProfile.experience
      : (user?.experience || []);

  const calculatedYears = calculateCandidateExperienceYears(experienceList);

  const projectsList = (resumeParsedData?.projects && resumeParsedData.projects.length > 0)
    ? resumeParsedData.projects
    : (existingProfile?.projects && existingProfile.projects.length > 0)
      ? existingProfile.projects
      : (user?.projects || []);

  const educationList = (resumeParsedData?.education && resumeParsedData.education.length > 0)
    ? resumeParsedData.education
    : (existingProfile?.education && existingProfile.education.length > 0)
      ? existingProfile.education
      : (user?.education || []);

  const certificationsList = (resumeParsedData?.certifications && resumeParsedData.certifications.length > 0)
    ? resumeParsedData.certifications
    : (existingProfile?.certifications && existingProfile.certifications.length > 0)
      ? existingProfile.certifications
      : (user?.certifications || []);

  let highestEducationLevel = 'bachelor';
  const levelPriority = { doctorate: 5, master: 4, bachelor: 3, diploma: 2, other: 1 };
  if (educationList.length > 0) {
    let topRank = 0;
    for (const edu of educationList) {
      const rank = levelPriority[edu.level] || 1;
      if (rank > topRank) {
        topRank = rank;
        highestEducationLevel = edu.level || 'bachelor';
      }
    }
  }

  const profile = await CandidateProfile.findOneAndUpdate(
    { applicationId, firebaseUid },
    {
      firebaseUid,
      applicationId,
      fullName: resumeParsedData?.contactDetails?.fullName?.value || user?.name || existingProfile?.fullName || '',
      email: resumeParsedData?.contactDetails?.email?.value || user?.email || existingProfile?.email || '',
      phone: resumeParsedData?.contactDetails?.phone?.value || existingProfile?.phone || '',
      links: {
        github: resumeParsedData?.contactDetails?.links?.github?.value || user?.links?.github || existingProfile?.links?.github || '',
        linkedin: resumeParsedData?.contactDetails?.links?.linkedin?.value || user?.links?.linkedin || existingProfile?.links?.linkedin || '',
        portfolio: resumeParsedData?.contactDetails?.links?.portfolio?.value || user?.links?.portfolio || existingProfile?.links?.portfolio || ''
      },
      skills: Array.from(skillsMap.values()),
      experience: experienceList,
      projects: projectsList,
      education: educationList,
      certifications: certificationsList,
      calculatedExperienceYears: calculatedYears,
      highestEducationLevel
    },
    { new: true, upsert: true }
  );

  return profile;
}
