var express = require('express');
var router = express.Router();
const multer = require('multer');
var bcrypt = require('bcrypt');
const moment = require('moment');
const {
  body,
  check,
  validationResult
} = require('express-validator');


const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '././public/images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + '-' + file.originalname);
  }
});

const kirim = multer({
  storage: fileStorage
});

const db = require('../models');
const {
  request
} = require('../app');
const Beritas = db.beritas;
const Komentars = db.komentars;
const Users = db.users;
const Op = db.Sequelize.Op;


const config = require('../config');
const passport = require('passport');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/berita', function (req, res, next) {
  Beritas.findAll({
    attributes: ['id', 'judul', 'author','image','artikel','createdAt']
  })
    .then(berita => {
      if (berita.length < 1) {
        

        res.send({
          message: "Berita tidak ada"
        });
      } else {
        
        res.send({berita});
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });
});

router.get('/berita/:id', async function (req, res, next) {
  const id = req.params.id;
  const komentarsss = await Komentars.findAll({
    where: {
      idberita: id
    },
    attributes: ['username', 'komentar','createdAt']
  });
  await Beritas.findByPk(id,{
    attributes: ['id', 'judul', 'author','image','artikel','createdAt']})
    .then(berita => {
      if (berita) {
        const beritaAll = {
          berita: berita,
          Komentar: komentarsss
        }
        res.send(beritaAll);
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });
});

router.post('/berita',
passport.authenticate("jwt", {
  session: false
}), kirim.array('image', 1), [
  check('judul')
  .notEmpty().withMessage('Judul harus diisi.'),
  check('author')
  .notEmpty().withMessage('author harus diisi.'),
  check('artikel')
  .notEmpty().withMessage('Artikel harus diisi.')


], async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let msgerror = []
    const err = errors.array();
    err.forEach(err => {
      msgerror.push(err.msg);
    })
      res.send({Message : msgerror});
  } else {
    let image = req.files[0].filename;


    let berita = {
      judul: req.body.judul,
      author: req.body.author,
      image: image,
      artikel: req.body.artikel
    }
    Beritas.create(berita)
      .then(berita => {
        res.send({message: "Berita Berhasil Di Tambahkan"});
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        })
      });

  };

});

router.post('/berita/:id/komentar/', kirim.array('image', 1), [
  check('username')
  .notEmpty().withMessage('username harus diisi.'),
  check('komentar')
  .notEmpty().withMessage('komentar harus diisi.')

], async function (req, res, next) {
  const id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let msgerror = []
    const err = errors.array();
    err.forEach(err => {
      msgerror.push(err.msg);
    })
      res.send({Message : msgerror});
  } else {


    let berita = {
      idberita: id,
      username: req.body.username,
      komentar: req.body.komentar
    }
    Komentars.create(berita)
      .then(komentar => {
        
          res.send({message: "Komentar Berhasil Di tambahkan."});
        
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        })
      });

  };

});

router.put('/berita/:id',
passport.authenticate("jwt", {
  session: false
}), kirim.array('image', 1), [
  check('judul')
  .notEmpty().withMessage('Judul harus diisi.'),
  check('artikel')
  .notEmpty().withMessage('Artikel harus diisi.')


], async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let msgerror = []
    const err = errors.array();
    err.forEach(err => {
      msgerror.push(err.msg);
    })
      res.send({Message : msgerror});
  } else {
    const id = req.params.id;
    let image = req.files[0].filename;


    let berita = {
      judul: req.body.judul,
      author: req.body.author,
      image: image,
      artikel: req.body.artikel
    }
    Beritas.update(berita, {
        where: {
          id: id
        }
      })
      .then(dataBerita => {
        res.send({message: "Berita Berhasil Di Update"});
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        })
      });
  };

});

router.delete('/berita/:id',
passport.authenticate("jwt", {
  session: false
}), async function (req, res, next) {
  const id = req.params.id;

  Beritas.destroy({
      where: {
        id: id
      }
    })
    .then(berita => {
      if (berita) {
        res.send({Message : "Berita Berhasil Dihapus"});
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      })
    });


});

// Get all Data
router.get('/users',
  passport.authenticate("jwt", {
    session: false
  }),
  function (req, res, next) {
    Users.findAll({
        attributes: ['id', 'nama', 'email', 'username']
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        });
      });

  });
// get profile user
router.get('/profile/:id', function (req, res, next) {
  const id = req.params.id;
  Users.findOne({
      id: id,
      attributes: ['nama', 'email', 'username']
    })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: "tidak ada id=" + id
        })
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });

});

// create Registrasi
router.post('/register',[
  check('nama')
  .notEmpty().withMessage('Nama harus diisi.'),
  body('email').custom(async (valueEmail, ) => {
    // Mencari nama yang sama di query
    const Email = await Users.findOne({
      where: {
        email: valueEmail
      }
    });
    if (Email) {
      throw new Error(`Email ${valueEmail} sudah terdaftar! `);
    }
    return true;
  })
  .notEmpty().withMessage('Email harus diisi.')
  .isEmail().withMessage('Email tidak valid.'),
  body('username').custom(async (valueUsername) => {
    // Mencari nama yang sama di query
    const username = await Users.findOne({
      where: {
        username: valueUsername
      }
    });


    if (username) {
      throw new Error(`Username ${valueUsername} sudah terdaftar! `);

    }

    return true;
  })
  .notEmpty().withMessage('Username harus diisi.')
  .isLength({
    max: 20
  }).withMessage('Username maximal Harus 20 karakter.'),
  check('password')
  .notEmpty().withMessage('Password harus diisi.')
  .isLength({
    min: 6
  }).withMessage('password minimal Harus 6 karakter.'),

], function (req, res, next) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let msgerror = [];
    const err = errors.array();
    err.forEach(err => {
      msgerror.push(err.msg);
    })
      res.send({Message : msgerror});
  } else {
  let passwordHash = bcrypt.hashSync(req.body.password, 10);
  let user = {
    nama: req.body.nama,
    email: req.body.email,
    username: req.body.username,
    password: passwordHash
  }
  Users.create(user)
    .then(data => {
      res.send({
        message: "Berhasil Registrasi"
      });
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });
  }
});


// create Products
router.post('/login', function (req, res, next) {
  Users.findOne({
      where: {
        username: req.body.username
      }
    })
    .then(data => {
      if (data) {
        var loginValid = bcrypt.compareSync(req.body.password, data.password);
        if (loginValid) {
          // JWT Authentication
          let payload = {
            userid: data.id,
            username: req.body.username
          };

          let token = jwt.sign(
            payload,
            config.secret, {
              expiresIn: '12h'
            }

          )
          let dt = new Date();
          dt.setHours(dt.getHours() + 12);
          res.json({
            success: true,
            token: token,
            expired: dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString()
          });
        } else {
          res.json({
            message: "username dan password Salah"
          })
        }

      } else {
        res.json({
          message: "username dan password Salah"
        });
      }
    })
    .catch(err => {
      res.json({
        message: "username dan password Salah"
      });
    });


});




module.exports = router;