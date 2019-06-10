exports.isLogin = async (req,res,next) => {
    if (req.session.user && req.session.user.uid) {
        return next();
    } else {
        return res.send('<script>alert("로그인이 필요한 서비스입니다."); window.location.href="/login"; </script>');
    }
};

exports.isNotLogin = async (req,res,next) => {
    if (req.session.user && req.session.user.uid) {
        return res.send('<script>alert("로그인된 사용자입니다."); history.back(); </script>');
    } else {
        return next();
    }
};