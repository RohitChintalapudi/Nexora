import { FeedbackModel } from '../models/feedbackModel.js';

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000; // 90 days (3 months)

export const feedbackController = {
  /**
   * Check 3-month feedback eligibility status for authenticated user
   * GET /api/feedback/status
   */
  async getStatus(req, res) {
    try {
      const latest = await FeedbackModel.getLatestByUser(req.user.id);
      
      let isEligible = true;
      let lastSubmittedAt = null;
      let nextFeedbackDate = null;
      let daysRemaining = 0;

      if (latest && latest.created_at) {
        lastSubmittedAt = new Date(latest.created_at);
        const nextEligibleTime = lastSubmittedAt.getTime() + THREE_MONTHS_MS;
        nextFeedbackDate = new Date(nextEligibleTime);
        
        if (Date.now() < nextEligibleTime) {
          isEligible = false;
          daysRemaining = Math.ceil((nextEligibleTime - Date.now()) / (1000 * 60 * 60 * 24));
        }
      }

      return res.status(200).json({
        success: true,
        isEligible,
        lastSubmittedAt,
        nextFeedbackDate,
        daysRemaining
      });
    } catch (error) {
      console.error('Feedback status error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve feedback status'
      });
    }
  },

  /**
   * Submit user feedback from the dashboard widget
   * POST /api/feedback
   */
  async submitFeedback(req, res) {
    try {
      const { happiness, feedback, page } = req.body;

      const rating = parseInt(happiness, 10);
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Please select a happiness rating (1-5) before submitting.'
        });
      }

      // Check if user has already submitted feedback in the last 3 months
      const latest = await FeedbackModel.getLatestByUser(req.user.id);
      if (latest && latest.created_at) {
        const lastSubmittedTime = new Date(latest.created_at).getTime();
        const nextEligibleTime = lastSubmittedTime + THREE_MONTHS_MS;
        if (Date.now() < nextEligibleTime) {
          const daysRemaining = Math.ceil((nextEligibleTime - Date.now()) / (1000 * 60 * 60 * 24));
          return res.status(400).json({
            success: false,
            isEligible: false,
            message: `Feedback was already received. You can submit feedback again after 3 months (in ${daysRemaining} days).`,
            nextFeedbackDate: new Date(nextEligibleTime)
          });
        }
      }

      const created = await FeedbackModel.create({
        userId: req.user.id,
        happiness: rating,
        feedback: typeof feedback === 'string' ? feedback.trim() : '',
        page
      });

      const nextFeedbackDate = new Date(Date.now() + THREE_MONTHS_MS);

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your feedback has been received. We will ask again in 3 months.',
        data: created,
        nextFeedbackDate
      });
    } catch (error) {
      console.error('Feedback submit error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save feedback. Please try again.'
      });
    }
  },

  /**
   * List feedback submitted by the authenticated user
   * GET /api/feedback
   */
  async getFeedback(req, res) {
    try {
      const items = await FeedbackModel.listByUser(req.user.id);
      return res.json({ success: true, data: items });
    } catch (error) {
      console.error('Feedback list error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to load feedback.'
      });
    }
  }
};