const express = require('express');
const router = express.Router();

const labCtrl = require('./lab.ctrl');
const needsAuth = require('../../lib/needsAuth');

router.get('/', (req,res) => {
    res.redirect('/lab/latest');
});

router.get('/latest', needsAuth.isLogin, labCtrl.findLabs);

router.get('/search', needsAuth.isLogin, labCtrl.findLabsByKeyword);
router.get('/search/:keyword', needsAuth.isLogin, labCtrl.findLabsByKeyword);

router.get('/:lid', needsAuth.isLogin, labCtrl.findLabEvalsById);

router.get('/eval/:lid', needsAuth.isLogin, labCtrl.writeLabEvals);
router.post('/eval/:lid', needsAuth.isLogin, labCtrl.uploadLabEvals);

router.get('/delete/:lab_eid', needsAuth.isLogin, labCtrl.deleteLabEvals);
router.get('/update/:lab_eid', needsAuth.isLogin, labCtrl.rewriteLabEvals);
router.post('/update/:lab_eid', needsAuth.isLogin, labCtrl.updateLabEvals);


module.exports = router;