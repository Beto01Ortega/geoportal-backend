const express           = require('express');
const Controller   = require('../../controllers/user.controller');
const { ensureAuth }    = require('../../lib/auth');

const router = express.Router();
const PATH = 'users';

router.get(`/${PATH}/all`, ensureAuth, Controller.getUsers);
router.get(`/${PATH}/get/:id`, ensureAuth, Controller.getUser);

router.post(`/${PATH}`, ensureAuth, Controller.addUser);
router.put(`/${PATH}/:id`, ensureAuth, Controller.editUser);
router.patch(`/${PATH}/status/:id`, ensureAuth, Controller.toggleStatus);

router.delete(`/${PATH}/:id`, ensureAuth, Controller.removeUser);

module.exports = router;