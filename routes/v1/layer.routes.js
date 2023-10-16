const express = require('express');
const { ensureAuth } = require('../../lib/auth');
const { uploadFile, uploadFiles } = require('../../lib/uploader');

const Controller = require('../../controllers/layer.controller');

const router = express.Router();
const PATH = 'layers';

router.get(`/${PATH}/all`, ensureAuth, Controller.getAll);
router.get(`/${PATH}/get/:id`, ensureAuth, Controller.getRecord);
router.get(`/${PATH}/download/:path`, ensureAuth, Controller.downloadFile);

router.post(`/${PATH}/shapes`, ensureAuth, uploadFiles, Controller.addLayerShapes);
router.post(`/${PATH}/raster`, ensureAuth, uploadFile, Controller.addLayerRaster);
router.put(`/${PATH}/:id`, ensureAuth, uploadFile, Controller.editRecord);


router.delete(`/${PATH}/:id`, ensureAuth, Controller.removeRecord);

module.exports = router;