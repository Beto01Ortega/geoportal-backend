const express    = require("express");
const error      = require("http-errors");
const logger     = require("morgan");
const cors       = require('cors');
const { join }   = require('path');
const bodyParser = require('body-parser');

require('dotenv').config({ path: join(__dirname, '.env') });

const app = express();
app.use(logger("dev"));
app.use(bodyParser.json({limit: '50mb'})); 
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(join(__dirname, 'public')));
app.set('trust proxy', true);

// User Manager Routes
app.use('/api/v1', require('./routes/v1/role.routes'));
app.use('/api/v1', require('./routes/v1/user.routes'));
app.use('/api/v1', require('./routes/v1/auth.routes'));

app.use('/api/v1', require('./routes/v1/category.routes'));
app.use('/api/v1', require('./routes/v1/layer.routes'));
app.use('/api/v1', require('./routes/v1/geoserver.routes'));
app.use('/api/v1', require('./routes/v1/geolocation.routes'));

app.use(function (req, res, next) {
  next(error(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.send(err.message);
});

module.exports = app;