const express = require('express');
const router = express.Router();

const home = require('./home');
const auth = require('./auth');
const lecture = require('./lecture');
const lab = require('./lab');

router.use('/', home);

router.use('/auth', auth);

router.use('/lecture', lecture);

router.use('/lab', lab);

module.exports = router;