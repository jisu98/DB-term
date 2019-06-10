const express = require('express');
const router = express.Router();

const needsAuth = require('../../lib/needsAuth');

router.get('/', (req,res) => { 
    let authenticated = false;
    if (req.session.user && req.session.user.uid) {
        authenticated = true;
    }
    res.render('home', { 'authenticated': JSON.stringify(authenticated) });
});

router.get('/login', needsAuth.isNotLogin, (req,res) => {
    res.render('login');
})

router.get('/register', needsAuth.isNotLogin, (req,res) => { 
    res.render('register'); 
});

module.exports = router;