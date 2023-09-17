const express = require('express');
const Controller = require('../../controllers/file.controller');
const { ensureAuth } = require('../../lib/auth');
const { uploadFiles } = require('../../lib/uploader');

const router = express.Router();
const PATH = 'files';

router.get(`/${PATH}/all`, ensureAuth, Controller.getAllFiles);
router.get(`/${PATH}/download/:path`, ensureAuth, Controller.downloadFile);
router.get(`/${PATH}/get/:id`, ensureAuth, Controller.getFileAccess);

router.post(`/${PATH}`, ensureAuth, uploadFiles, Controller.addFileAccess);
router.put(`/${PATH}/:id`, ensureAuth, uploadFiles, Controller.editFileAccess);

router.delete(`/${PATH}/:id`, ensureAuth, Controller.removeFileAccess);

module.exports = router;