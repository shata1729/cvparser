// const https = require('https');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const express = require('express');
const cvApp = express();
var bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
cvApp.use(fileUpload());

//security packages
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// const cvServerIp = '127.0.0.1'
// const cvServerIp = '43.204.140.82'

const cvServerPort = '6000'

cvApp.use(xss());
cvApp.use(cors());
cvApp.use(hpp());
cvApp.use(xss());


//EJS
cvApp.set('view engine', 'ejs');

cvApp.use(bodyParser.json());
cvApp.use(bodyParser.urlencoded({ extended: true }));

//console
const logRequests = (req, res, next) => {
  console.log(
    'debug',
    `${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}`
  );
  if (req.method == 'POST' || req.method == 'post') {
    console.log('debug', `req.body is`);
    console.log(req.body);
  }
  next();
};
cvApp.use(logRequests);

// Routes
cvApp.use('/cv', require('./routes/cv.js'));
cvApp.use('/callback', require('./routes/callback.js'));

    http
      .createServer(cvApp)
      .listen(
        cvServerPort,
        // cvServerIp,
        console.log('debug', `HTTP:Server running on  ${cvServerPort}`)
      );
