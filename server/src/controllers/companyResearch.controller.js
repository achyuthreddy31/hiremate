import { Application } from '../models/application.model.js';
import { CompanyResearch } from '../models/companyResearch.model.js';
import { buildCompanyResearchDataset } from '../services/companyResearch.service.js';

export async function generateCompanyResearch(req, res) {
  try {
    const { applicationId } = req.params;
    const app = await Application.findOne({ _id: applicationId, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    const researchData = buildCompanyResearchDataset(app.companyName);

    const research = await CompanyResearch.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        ...researchData,
        firebaseUid: req.user.uid,
        applicationId
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: research
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESEARCH_ERROR', message: error.message }
    });
  }
}

export async function getCompanyResearch(req, res) {
  try {
    const { applicationId } = req.params;
    const research = await CompanyResearch.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!research) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company research not found. Please trigger research.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: research
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function toggleSectionReviewed(req, res) {
  try {
    const { applicationId } = req.params;
    const { category, reviewed } = req.body;

    const research = await CompanyResearch.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!research) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Company research not found' }
      });
    }

    const section = research.sectionsReviewed.find(s => s.category === category);
    if (section) {
      section.reviewed = reviewed;
      section.reviewedAt = new Date();
    } else {
      research.sectionsReviewed.push({ category, reviewed, reviewedAt: new Date() });
    }

    await research.save();

    return res.status(200).json({
      success: true,
      data: research.sectionsReviewed
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'REVIEW_TOGGLE_ERROR', message: error.message }
    });
  }
}

export async function submitQuizAnswers(req, res) {
  try {
    const { applicationId } = req.params;
    const { answers } = req.body; // array of selected indices

    const research = await CompanyResearch.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!research || !research.quiz || research.quiz.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' }
      });
    }

    let correctCount = 0;
    research.quiz.forEach((q, idx) => {
      if (answers && answers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const quizScore = Math.round((correctCount / research.quiz.length) * 100);
    research.latestQuizScore = quizScore;
    await research.save();

    return res.status(200).json({
      success: true,
      data: {
        quizScore,
        correctCount,
        totalQuestions: research.quiz.length,
        results: research.quiz.map((q, idx) => ({
          question: q.question,
          userAnswer: answers?.[idx],
          correctAnswer: q.correctAnswerIndex,
          isCorrect: answers?.[idx] === q.correctAnswerIndex,
          explanation: q.explanation,
          sourceUrl: q.sourceUrl
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'QUIZ_SUBMIT_ERROR', message: error.message }
    });
  }
}
