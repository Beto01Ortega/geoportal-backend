const express = require('express');
const { ensureAuth } = require('../../lib/auth');
const Controller = require('../../controllers/geoserver.controller');

const router = express.Router();
const PATH = 'geoserver';

router.post(`/${PATH}/create/datastore/:id`, ensureAuth, Controller.createDataStore);
router.post(`/${PATH}/create/shape/:id`, ensureAuth, Controller.createShapeLayer);
router.post(`/${PATH}/create/styles/:id`, ensureAuth, Controller.addStyles);

router.post(`/${PATH}/create/coveragestore/:id`, ensureAuth, Controller.createCoverageStore);
router.post(`/${PATH}/create/raster/:id`, ensureAuth, Controller.createRasterLayer);

module.exports = router;