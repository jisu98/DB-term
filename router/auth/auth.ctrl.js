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

const util = require('util');
const crypto = require('crypto');
const randomBytes = util.promisify(crypto.randomBytes);
const pbkdf2 = util.promisify(crypto.pbkdf2);

//회원가입 기능
exports.register = async (req,res) => {
    const { username, uid, name, password, password_confirm } = req.body;
    const re = /^[0-9]{10}$/;

    if(!uid || !password || !password_confirm || !name || !username) {
        res.send('<script>alert("모든 항목을 입력해주세요."); history.back(); </script>');
    } else if(uid.match(re) === null) {
        res.send('<script>alert("잘못된 학번입니다. "); history.back(); </script>');
    } else if(password.length < 4) {
        res.send('<script>alert("비밀번호는 최소 4글자로 정해야 합니다. "); history.back(); </script>')
    } else if(password !== password_confirm) {
        res.send('<script>alert("비밀번호를 다시 확인해주세요."); history.back(); </script>');
    } else {
        try {
            const salt = await randomBytes(64);
            const pwd = await pbkdf2(password, salt.toString('base64'), 100000, 64, 'sha512');
            const data = [uid,name,username,pwd.toString('base64'),salt.toString('base64'),new Date()];
            await processQuery('INSERT INTO `user` (uid,name,username,pwd,pwd_help,register) VALUES (?,?,?,?,?,?)', data);
            res.redirect('/');
        } catch (e) {
            res.send('<script>alert("잘못된 학번 또는 닉네임입니다. "); history.back(); </script>');
            throw e;
        }
    }
};

//로그인 기능
exports.login = async (req,res) => {
    const { uid, password } = req.body;
    if(!uid || !password) {
        res.send('<script>alert("모든 항목을 입력해주세요."); history.back(); </script>');
    } else {
        try {
            const db_result = await processQuery('SELECT uid,identity,pwd,pwd_help FROM `user` WHERE uid = ?', [uid]);
            if(db_result.length > 0) {
                const input = await pbkdf2(password, db_result[0].pwd_help, 100000, 64, 'sha512');
                if(input.toString('base64') === db_result[0].pwd) {
                    req.session.user = {
                        uid: uid, 
                        username: db_result[0].username
                    };
                    res.redirect(`/`);
                } else {
                    res.send('<script>alert("로그인에 실패하였습니다. "); history.back(); </script>');
                }
            } else {
                res.send('<script>alert("잘못된 학번 또는 비밀번호입니다. "); history.back(); </script>');
            }
        } catch (e) {
            res.send('<script>alert("오류가 발생했습니다. "); history.back(); </script>');
            throw e;
        }
    }
};

//로그아웃 기능
exports.logout = async (req,res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (e) {
        throw e;
    }
};
