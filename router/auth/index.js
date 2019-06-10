const express = require('express');
const router = express.Router();

const authCtrl = require('./auth.ctrl');
const needsAuth = require('../../lib/needsAuth');

router.post('/login', authCtrl.login);

router.get('/logout', needsAuth.isLogin, authCtrl.logout);

router.post('/register', needsAuth.isNotLogin, authCtrl.register);

module.exports = router;