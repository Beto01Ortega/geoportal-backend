const express = require('express');
const Controller = require('../../controllers/category.controller');
const { ensureAuth } = require('../../lib/auth');

const router = express.Router();
const PATH = 'categories';

router.get(`/${PATH}/all`, Controller.getAll);
router.get(`/${PATH}/all/sub/:id`, ensureAuth, Controller.getAllSub);
router.get(`/${PATH}/get/:id`, Controller.getRecord);

router.post(`/${PATH}`, ensureAuth, Controller.addRecord);
router.put(`/${PATH}/:id`, ensureAuth, Controller.editRecord);


router.delete(`/${PATH}/:id`, ensureAuth, Controller.removeRecord);

module.exports = router;