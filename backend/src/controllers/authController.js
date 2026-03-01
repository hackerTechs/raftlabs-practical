const config = require('../config');

const authController = {
  /**
   * POST /api/auth/login
   * Validates the email and returns user info (no token needed).
   */
  login: (req, res) => {
    const trimmedEmail = req.body.email.trim().toLowerCase();

    res.json({
      success: true,
      data: {
        email: trimmedEmail,
        isAdmin: trimmedEmail === config.adminEmail,
      },
    });
  },
};

module.exports = authController;
