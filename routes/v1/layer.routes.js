const express = require('express');
const Controller = require('../../controllers/layer.controller');
const { ensureAuth } = require('../../lib/auth');

const router = express.Router();
const PATH = 'layers';

router.get(`/${PATH}/all`, ensureAuth, Controller.getAll);
router.get(`/${PATH}/get/:id`, ensureAuth, Controller.getRecord);

router.post(`/${PATH}`, ensureAuth, Controller.addRecord);
router.put(`/${PATH}/:id`, ensureAuth, Controller.editRecord);


router.delete(`/${PATH}/:id`, ensureAuth, Controller.removeRecord);

module.exports = router;