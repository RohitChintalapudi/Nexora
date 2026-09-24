import { FeedbackModel } from '../models/feedbackModel.js';

export const feedbackController = {
  /**
   * Submit user feedback from the dashboard widget
   * POST /api/feedback
   */
  async submitFeedback(req, res) {
    try {
      const { happiness, feedback, page } = req.body;

      const rating = parseInt(happiness, 10);
      if (!rating || rating < 1 || rating > 4) {
        return res.status(400).json({
          success: false,
          message: 'Please select a happiness rating (1-4) before submitting.'
        });
      }

      const created = await FeedbackModel.create({
        userId: req.user.id,
        happiness: rating,
        feedback: typeof feedback === 'string' ? feedback.trim() : '',
        page
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your feedback has been received.',
        data: created
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