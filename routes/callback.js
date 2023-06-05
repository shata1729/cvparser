const express = require('express');
const router = express.Router();
const path = require('path');
const cors = require('cors');

const corsOptions = {
  exposedHeaders: 'Location',
};

router.get('/', async function (req, res) {
console.log(req.params)
console.log(req.body)

})

module.exports =  router
