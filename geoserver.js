const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.GEOSERVER_URL,
  auth: {
    username: process.env.GEOSERVER_USR,
    password: process.env.GEOSERVER_PSW,
  },
})

module.exports = {
  instance,
}