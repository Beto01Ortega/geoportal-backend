const axios = require('axios');
const sequelize = require('sequelize')
const { Visit } = require('../database');

const GeoLocation = {};

GeoLocation.registerVisit = (req,res) => {
  Visit.findOne({ 
    where: { ip: req.body.ip_address } 
  }).then(async (visit) => {
    if(visit) {
      visit.visit_count += 1;
      await visit.save();
      return res.status(200).send({ message: 'OK' });
    } else {
      axios.get(`${process.env.IPLOCATION_URL}/?ip=${req.body.ip_address}`).then(response => {
        let data = response.data;
        Visit.create({
          ip: data.ip,
          ip_ver: data.ip_version,
          country_name: data.country_name,
          country_code: data.country_code2,
        }).then(obj => {
          return res.status(200).send({ message: 'OK' });
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
      });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

GeoLocation.visitCountByCountries = (req,res) => {
  Visit.findAll({
    attributes: [
      'country_name',
      [sequelize.fn('SUM', sequelize.col('visit_count')), 'total_visits']
    ],
    group: 'country_name'
  }).then(result => {
    return res.status(200).send(result);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

GeoLocation.uniqueVisitCount = (req,res) => {
  Visit.findAll({
    order: [
      ['updated_at', 'DESC']
    ],
    limit: 50,
  }).then(results => {
    return res.status(200).send(results);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

module.exports = GeoLocation;