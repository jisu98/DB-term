const express = require('express');
const router = express.Router();

const lectureCtrl = require('./lecture.ctrl');
const needsAuth = require('../../lib/needsAuth');

router.get('/', (req,res) => {
    res.redirect('/lecture/latest');
});

router.get('/latest', lectureCtrl.findLatestLectureEvals);

router.get('/search', needsAuth.isLogin, lectureCtrl.findLecturesByKeyword);
router.get('/search/:keyword', needsAuth.isLogin, lectureCtrl.findLecturesByKeyword);

router.get('/:lid', needsAuth.isLogin, lectureCtrl.findLectureEvalsById);

router.get('/eval/:lid', needsAuth.isLogin, lectureCtrl.writeLectureEvals);
router.post('/eval/:lid', needsAuth.isLogin, lectureCtrl.uploadLectureEvals);

router.get('/delete/:lec_eid', needsAuth.isLogin, lectureCtrl.deleteLectureEvals);
router.get('/update/:lec_eid', needsAuth.isLogin, lectureCtrl.rewriteLectureEvals);
router.post('/update/:lec_eid', needsAuth.isLogin, lectureCtrl.updateLectureEvals);

module.exports = router;