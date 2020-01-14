const express = require('express');
const multer = require('multer');
const path = require('path');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');
const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({ //서버 디스크에 이미지를 저장하겠다
      destination(req, file, cb) {
          cb(null, 'uploads/')
          //cb=callback
      },
      filename(req, file, cb) {
          const ext = path.extname(file.originalname);
          cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
          //파일 명이 중복되는 경우를 방지하기 위해 현재 시간 표시
      },
    }),
    limit: { fileZize: 5 * 1024 * 1024 },
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.body, req.file);
    res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
    //게시글 업로드
    try {
      const post = await Post.create({
       content: req.body.content,
       img: req.body.url,
       userId: req.user.id,
      });
      const hashtags = req.body.content.match(/#[^\s]*/g);
      if (hashtags) {
          //안녕하세요 #노드 #익스프레스
          //hashtags = ['#노드', '#익스프레스'] ['#노드', '#atom']
          const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
              //findOrCreate(): db에 있으면 찾고 없으면 만들어줌
           where: { title: tag.slice(1).toLowerCase() },
           //# 표시 떼기 위해, 전부 소문자로 만듦
          })));
          await post.addHashtags(result.map(r => r[0]));
          //hashtag 번호와 post 번호를 이어주는 행위(다대다 관계)
      }
      res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
});
//사진을 안 올릴 경우 none

router.delete('/:id', async (req, res, next) => {
    try {
        await Post.destroy({ where: { id: req.params.id, userId: req.user.id }});
        res.send('OK');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
        return res.redirect('/');
        //입력이 없으면 메인 페이지로 이동
    }
    try {
        const hashtag = await Hashtag.findOne({ where: { title: query }});
        let posts = [];
        if (hashtag) {
            posts = await hashtag.getPosts({ include: [{ model: User }]});
        }
        return res.render('main', {
            title: `${query} | NodeBird`,
            user: req.user,
            twits: posts,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.post('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.find({ where: { id: req.params.id }});
        await post.addLiker(req.user.id);
        res.send('OK');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

router.delete('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.find({ where: { id: req.params.id }});
        await post.removeLiker(req.user.id);
        res.send('OK');
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;