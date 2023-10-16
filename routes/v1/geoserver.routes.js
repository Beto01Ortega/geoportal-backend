const express = require('express');
const { ensureAuth } = require('../../lib/auth');
const Controller = require('../../controllers/geoserver.controller');

const router = express.Router();
const PATH = 'geoserver';

router.post(`/${PATH}/publish/shape/:id`, ensureAuth, Controller.publishShape);
router.post(`/${PATH}/publish/raster/:id`, ensureAuth, Controller.publishRaster);

module.exports = router;