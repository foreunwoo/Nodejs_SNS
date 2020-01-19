const LocalStorage = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new LocalStorage({
        usernameField: 'email', 
        //req.body.email 폼에서 해석해서 넣음
        passwordField: 'password', 
        //req.body.password 
    }, async (email, password, done) => { 
        //콜백 함수, 성공했을 때 뭐할지 전략, done(에러, 성공, 실패)
          try{
          const exUser = await User.find({ where: { email }});
          if (exUser) {
              //비밀번호 검사
              const result = await bcryptjs.compare(password, exUser.password);
              //사용자가 입력한 비밀번호와 db에 있는 비밀번호를 비교함
              if(result) {
                  done(null, exUser); //성공
              } else {
                  done(null, false, { message: '비밀번호가 일치하지 않습니다.'});
              }
          } else {
              done(null, false, { message: '가입되지 않은 회원입니다.'});
          }
          }catch(error){ 

        console.error(error);
        done(error); //에러가 떠서 실패한 것
          }
    }));
};