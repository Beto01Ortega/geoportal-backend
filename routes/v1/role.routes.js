const express           = require('express');
const Controller    = require('../../controllers/role.controller');
const { ensureAuth }    = require('../../lib/auth');

const router = express.Router();
const PATH = 'roles';

router.get(`/${PATH}`, ensureAuth, Controller.getRoles);
router.post(`/${PATH}`, ensureAuth, Controller.addRole);

module.exports = router;