exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) { //로그인 여부를 알려줌
      next();
    } else {
        res.status(403).send('로그인 필요');
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { 
        next();
    } else { //아무거나 해도 됨. if 부분이 중요
        res.redirect('/');
    }
};