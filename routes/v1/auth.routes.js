const express = require('express');
const AuthController = require('../../controllers/auth.controller');
const { ensureAuth } = require('../../lib/auth');

const router = express.Router();
const PATH = 'auth';

router.post(`/${PATH}/login`, AuthController.login);
router.post(`/${PATH}/update-password`, ensureAuth, AuthController.updatePassword);
router.post(`/${PATH}/restore-password`, AuthController.generateNewPassword);

router.get(`/${PATH}/get-data`, ensureAuth, AuthController.getData);

module.exports = router;