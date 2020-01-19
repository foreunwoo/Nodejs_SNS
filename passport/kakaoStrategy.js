const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

// 흐름(2) (4)
module.exports = (passport) => {
    passport.use(new KakaoStrategy({
      clientID: process.env.KAKAO_ID,
      callbackURL: '/auth/kakao/callback',
      // 1. /auth/kakao로 요청 -> 카카오 인증서버로 요청을 보냄
      // 2. 카카오 로그인
      // 3. /auth/kakao/callback으로 프로필 반환
      
    }, async (accessToken, refreshToken, profile, done) => {
     try { 
         const exUser = await User.find({
          where: {
              snsId: profile.id,
              provider: 'kakao',
          },
      });
      if (exUser) {
          done(null, exUser);
      } else {
          const newUser = await User.create({
              email: profile._json && profile._json.kaccount_email,
              nick: profile.displayName,
              snsId: profile.id,
              provider: 'kakao',
          });
          done(null, newUser);
      }
    } catch (error) {
        console.error(error);
        done(error);
    }
}))
};