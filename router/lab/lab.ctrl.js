const mysql_db = require('../../database/db.config')();
const pool = mysql_db.init();

async function processQuery(query,data) {
    try {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');
            const sql = conn.format(query,data);
            const [result] = await conn.query(sql);
            await conn.commit();
            conn.release();
            return result;
        } catch (e) {
            await conn.rollback();
            conn.release();
            throw e;
        }
    } catch (e) {
        throw e;
    }
}

exports.findLabs = async (req,res) => {
    try {
        const result = await processQuery('SELECT username, teacher_name, lab_evaluation, convert_tz(submission, \'+00:00\', \'+09:00\') AS submission, lab_name FROM `lab_eval` NATURAL JOIN `user` NATURAL JOIN `lab` NATURAL JOIN `teacher` ORDER BY submission DESC LIMIT 10');
        res.render('lab', { 'result': JSON.stringify(result), 'title': JSON.stringify('최신 연구실평가') });
    } catch (e) {
        throw e;
    }
}

exports.findLabsByKeyword = async (req,res) => {
    try {
        let { keyword } = req.params;
        if (keyword === undefined) keyword = '';
        console.log(keyword);
        const result = await processQuery(`SELECT teacher_name, lab_name, lid FROM teacher NATURAL JOIN lab WHERE teacher_name LIKE "%${keyword}%" OR lab_name LIKE "%${keyword}%"`);
        res.render('lab', { 'result': JSON.stringify(result), 'title': JSON.stringify('연구실 검색 결과') });
    } catch (e) {
        throw e;
    }
}

exports.findLabEvalsById = async (req,res) => {
    try {
        const { lid } = req.params;
        const result = await processQuery(`SELECT lab_eid, username, teacher_name, lab_evaluation, convert_tz(submission, \'+00:00\', \'+09:00\') AS submission, lab_name FROM lab_eval NATURAL JOIN user NATURAL JOIN lab NATURAL JOIN teacher WHERE lid="${lid}"`);

        res.render('lab', { 'result': JSON.stringify(result), 'title': JSON.stringify('연구실평가 검색 결과') });
    } catch (e) {
        throw e;
    }
}


exports.writeLabEvals = async (req,res) => {
    try {
        const { lid } = req.params;
        const result = await processQuery(`SELECT lab_name, lid FROM lab WHERE lid="${lid}"`);
        res.render('eval', { 'result': JSON.stringify(result), 'mode': JSON.stringify('write_lab_eval') });
    } catch (e) {
        throw e;
    }
}
exports.uploadLabEvals = async (req,res) => {
    try {
        const { lid } = req.params;
        const { lab_evaluation } = req.body;
        const uid = req.session.user.uid;
        await processQuery(`INSERT INTO lab_eval(uid,lid,lab_evaluation) VALUES ("${uid}","${lid}","${lab_evaluation}")`);
        res.send('<script>alert("등록되었습니다. "); history.go(-2); </script>');
    } catch (e) {
        res.send('<script>alert("데이터베이스에 존재하지 않는 연구실입니다. "); history.go(-2); </script>');
    }
}

exports.deleteLabEvals = async (req,res) => {
    try{
        const { lab_eid } = req.params;
        const result = await processQuery(`SELECT uid FROM lab_eval WHERE lab_eid=${lab_eid}`);
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            await processQuery(`DELETE FROM lab_eval WHERE lab_eid=${lab_eid}`);
            res.send('<script>alert("삭제되었습니다. "); history.go(-1); </script>');
        } else {
            res.send('<script>alert("내가 쓴 연구실평가만 삭제할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}

exports.rewriteLabEvals = async (req,res) => {
    try {
        const { lab_eid } = req.params;
        const result = await processQuery(`SELECT * FROM lab_eval NATURAL JOIN lab WHERE lab_eid=${lab_eid}`);
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            res.render('eval', { 'result': JSON.stringify(result), 'mode': JSON.stringify('rewrite_lab_eval') });
        } else {
            res.send('<script>alert("내가 쓴 연구실평가만 수정할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}

exports.updateLabEvals = async (req,res) => {
    try{
        const { lab_eid } = req.params;
        const result = await processQuery(`SELECT uid FROM lab_eval WHERE lab_eid=${lab_eid}`);
        const { lab_evaluation } = req.body;
        const uid = result[0].uid;
        if (uid === req.session.user.uid) {
            await processQuery(`UPDATE lab_eval SET lab_evaluation='${lab_evaluation}' WHERE lab_eid=${lab_eid}`)
            res.send('<script>alert("수정되었습니다. "); history.go(-2); </script>');
        } else {
            res.send('<script>alert("내가 쓴 연구실평가만 수정할 수 있습니다. "); history.go(-1); </script>');
        }
    } catch (e) {
        throw e;
    }
}
