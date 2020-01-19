const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

const user = {};

module.exports = (passport) => {
   passport.serializeUser((user, done) => {
       // { id:1, name:eunwoo, age:22 }, 다 넣기엔 무거우니 고유값 id만 저장
       done(null, user.id);
   });
   //메모리에 1번만 저장

   passport.deserializeUser((id, done) => {
       // 1 -> { id:1, name:eunwoo, age:22 } -> req.user
       //요청이 갈 때마다 매번 호출이 됨.
       User.find({ 
           where: { id },
           include: [{
               model: User,
               attributes: ['id', 'nick'],
               as: 'Followers',
           }, {
               model: User,
               attributes: ['id', 'nick'],
               as: 'Followings',
           }],
       })
       .then(user => done(null, user))
       .catch(err => done(err));
   });

    local(passport);
   kakao(passport);
};
