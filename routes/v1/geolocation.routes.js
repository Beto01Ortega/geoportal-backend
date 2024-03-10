const express = require('express');
const Controller = require('../../controllers/geolocation.controller');

const router = express.Router();
const PATH = 'visit';

router.post(`/${PATH}/register`, Controller.registerVisit);
router.get(`/${PATH}/counter/countries`, Controller.visitCountByCountries);
router.get(`/${PATH}/counter/unique`, Controller.uniqueVisitCount);

module.exports = router;