const express = require('express');
const authController = require('../controllers/authController');
const { validateLoginBody } = require('../middleware/validator');

const router = express.Router();

router.post('/login', validateLoginBody, authController.login);

module.exports = router;

