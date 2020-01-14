const express = require('express');
const bcryptjs = require('bcryptjs');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
// router.get(미들웨어1, 미들웨어2, 미들웨어3) 순서대로 실행됨
// POST /auth/join
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const {email, nick, password } = req.body;
    try {
      const exUser = await User.find({ where: { email }});
      if (exUser) {
          req.flash('joinError', '이미 가입된 이메일입니다.');
          return res.redirect('/join');
          //회원가입 페이지로 돌려보냄
      } 
      console.time('암호화 시간');
      const hash = await bcryptjs.hash(password, 12);
      //비크립트로 비밀번호 넣고 
      console.timeEnd('암호화 시간');
      await User.create({
          email,
          nick,
          password: hash,
      });
      return res.redirect('/');
    } catch(error) {
        console.error(error);
        next(error);
    }
});

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => { 
    //req.body.email, req.body.password
  passport.authenticate('local', (authError, user, info) => {
    //localStrategy에 있는 done 부분이 실행이 됨
    if(authError) {
        console.error(authError);
        return next(authError);
    }
    if(!user) {
        req.flash('loginError', info.message);
        return res.redirect('/');
    }
    return req.login(user, (loginError) => { 
        //req.user에서 사용자 정보 찾을 수 있음
        //패스포트가 추가해줌
      if (loginError) {
          console.error(loginError);
          return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy(); //req.user
    res.redirect('/');
});

// 흐름(1)
router.get('/kakao', passport.authenticate('kakao'));

// 흐름(3)
router.get('/kakao/callback', passport.authenticate('kakao', {
    failureRedirect: '/',
    //실패 시, 메인 라우터로 되돌아감
}), (req, res) => {
    res.redirect('/');
    //카카오 로그인 성공 시, 메인 라우터로 되돌아감
});

module.exports = router;