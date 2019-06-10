const mysql_db = require('../../database/db.config')();
const pool = mysql_db.init();

async function processQuery(query,data) {
    try {
        const conn = await pool.getConnection();
        try {
            const sql = conn.format(query,data);
            const [result] = await conn.query(sql);
            conn.release();
            return result;
        } catch (e) {
            conn.release();
            throw e;
        }
    } catch (e) {
        throw e;
    }
}

exports.findLatestLectureEvals = async (req,res) => {
    try {
        const result = await processQuery('SELECT username, teacher_name, lec_evaluation, year, semester, convert_tz(submission, \'+00:00\', \'+09:00\') AS submission, course_name FROM `lec_eval` NATURAL JOIN `user` NATURAL JOIN `class` NATURAL JOIN `teaches` NATURAL JOIN `teacher` ORDER BY submission DESC LIMIT 6');
        res.render('lecture', { 'result': JSON.stringify(result), 'title': JSON.stringify('최신 강의평가') });
    } catch (e) {
        throw e;
    }
}

exports.findLecturesByKeyword = async (req,res) => {
    try {
        let { keyword } = req.params;
        if (keyword === undefined) keyword = '';
        const result = await processQuery(`SELECT teacher_name, course_id, course_name FROM class NATURAL JOIN teaches NATURAL JOIN teacher WHERE course_id LIKE "%${keyword}%" OR course_name LIKE "%${keyword}%" OR teacher_name LIKE "%${keyword}%"`);
        res.render('lecture', { 'result': JSON.stringify(result), 'title': JSON.stringify('강의 검색 결과') });
    } catch (e) {
        throw e;
    }
}

exports.findLectureEvalsById = async (req,res) => {
    try {
        const { lid } = req.params;
        const result = await processQuery(`SELECT lec_eid, username, teacher_name, lec_evaluation, year, semester, convert_tz(submission, \'+00:00\', \'+09:00\') AS submission, course_name FROM lec_eval NATURAL JOIN user NATURAL JOIN class NATURAL JOIN teaches NATURAL JOIN teacher WHERE course_id="${lid}"`);

        res.render('lecture', { 'result': JSON.stringify(result), 'title': JSON.stringify('강의평가 검색 결과') });
    } catch (e) {
        throw e;
    }
}

exports.writeLectureEvals = async (req,res) => {
    try {
        const { lid } = req.params;
        const result = await processQuery(`SELECT course_name, course_id FROM class WHERE course_id="${lid}"`);
        res.render('eval', { 'result': JSON.stringify(result), 'mode': JSON.stringify('write_lec_eval') });
    } catch (e) {
        throw e;
    }
}
exports.uploadLectureEvals = async (req,res) => {
    try {
        const { lid } = req.params;
        const { year, semester, section, lecture_evaluation } = req.body;
        const uid = req.session.user.uid;
        await processQuery(`INSERT INTO lec_eval(uid,course_id,year,semester,section,lec_evaluation) VALUES ("${uid}","${lid}",${year},"${semester}","${section}","${lecture_evaluation}")`);
        res.send('<script>alert("등록되었습니다. "); history.go(-2); </script>');
    } catch (e) {
        res.send('<script>alert("데이터베이스에 존재하지 않는 수업입니다. "); history.go(-2); </script>');
    }
}

exports.deleteLectureEvals = async (req,res) => {
    try{
        const { lec_eid } = req.params;
        const result = await processQuery(`SELECT uid FROM lec_eval WHERE lec_eid=${lec_eid}`);
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            await processQuery(`DELETE FROM lec_eval WHERE lec_eid=${lec_eid}`);
            res.send('<script>alert("삭제되었습니다. "); history.go(-1); </script>');
        } else {
            res.send('<script>alert("내가 쓴 강의평가만 삭제할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}

exports.rewriteLectureEvals = async (req,res) => {
    try {
        const { lec_eid } = req.params;
        const result = await processQuery(`SELECT * FROM lec_eval NATURAL JOIN class WHERE lec_eid=${lec_eid}`);
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            res.render('eval', { 'result': JSON.stringify(result), 'mode': JSON.stringify('rewrite_lec_eval') });
        } else {
            res.send('<script>alert("내가 쓴 강의평가만 수정할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}

exports.updateLectureEvals = async (req,res) => {
    try{
        const { lec_eid } = req.params;
        const result = await processQuery(`SELECT uid FROM lec_eval WHERE lec_eid=${lec_eid}`);
        const { year, semester, section, lecture_evaluation } = req.body;
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            await processQuery(`UPDATE lec_eval SET year=${year},semester='${semester}',section='${section}',lec_evaluation='${lecture_evaluation}' WHERE lec_eid=${lec_eid}`)
            res.send('<script>alert("수정되었습니다. "); history.go(-2); </script>');
        } else {
            res.send('<script>alert("내가 쓴 강의평가만 수정할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}