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
  Beritas.findAll()
    .then(berita => {
      if (berita.length > 0) {

        res.send(berita);
      } else {

        res.send({
          message: "Berita tidak ada"
        });
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
    }
  });
  await Beritas.findByPk(id)
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

router.post('/berita', kirim.array('image', 1), [
  check('judul')
  .notEmpty().withMessage('Judul harus diisi.'),
  check('artikel')
  .notEmpty().withMessage('Artikel harus diisi.')


], async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addberita', {
      title: 'Posting Berita Baru',
      errors: errors.array(),
      username: username,
      data: req.body

    });
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
        res.send(berita);
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        })
      });

  };

});

router.put('/berita/:id', kirim.array('image', 1), [
  check('judul')
  .notEmpty().withMessage('Judul harus diisi.'),
  check('artikel')
  .notEmpty().withMessage('Artikel harus diisi.')


], async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errors = errors.array();
    errors.forEach(err => {
      res.send(err)
    })
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
        res.send(dataBerita);
      })
      .catch(err => {
        res.json({
          info: "Error",
          message: err.message
        })
      });

  };

});

router.delete('/berita/:id', async function (req, res, next) {
  const id = req.params.id;

  Beritas.destroy({
      where: {
        id: id
      }
    })
    .then(berita => {
      if (berita) {
        res.send(berita);
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

// Login Auth

router.put(`/editprofile/:id`, function (req, res, next) {
  let id = req.params.id;
  let passwordHash = bcrypt.hashSync(req.body.password, 10);
  let user = {
    nama: req.body.nama,
    email: req.body.email,
    username: req.body.username,
    password: passwordHash
  }
  Users.update(user, {
      where: {
        id: id
      }
    })
    .then(num => {
      if (num > 0) {
        res.send({
          messages: "data diperbarui"
        });
      } else {
        // http 404 not found
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
    })

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
    })

});

// create Registrasi
router.post('/register', function (req, res, next) {
  if (!(req.body.nama && req.body.email && req.body.username && req.body.password)) {
    return res.status(400).json({
      message: "tolong isi semua data"
    });
  }
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
    })

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
        console.log(loginValid);
        if (loginValid) {
          // JWT Authentication
          let payload = {
            userid: data.id,
            username: req.body.username
          };

          let token = jwt.sign(
            payload,
            config.secret, {
              expiresIn: '3h'
            }

          )
          let dt = new Date();
          dt.setHours(dt.getHours() + 3);
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