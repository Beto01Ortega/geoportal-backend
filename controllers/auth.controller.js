const { User, Role } = require("../database");
const { matchPassword, generateHash } = require("../lib/helpers");
const { createToken } = require("../lib/jwt");
const { randomPassword } = require('secure-random-password');
const { transport } = require('../lib/mailer');

const AuthController = {};

AuthController.login = (req, res) => {
  User.findOne({
    where: { email: req.body.email, status: true },
    include: [
      { model: Role, as: 'role' }
    ],
  }).then(user => {
    if (!user) {
      return res.status(404).send({ message: 'El usuario no existe.' });
    } else {
      if (matchPassword(req.body.password, user.password)) {
        let token = createToken(user);

        return res.status(200).send({
          data: {
            id_user: user.id_user,
            name: user.name,
            email: user.email,
            status: user.status,
            created_at: user.created_at,
            updated_at: user.updated_at,
            role: user.role,
          },
          token: token,
        });
      } else {
        return res.status(401).send({ message: 'Contraseña incorrecta.' });
      }
    }
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
};

AuthController.getData = (req, res) => {
  User.findOne({
    where: { id_user: req.user.id, status: true },
    include: [
      { model: Role, as: 'role' }
    ],
  }).then(user => {
    if (!user) {
      return res.status(404).send({ message: 'El usuario no existe.' });
    } else {
      let token = createToken(user);

      return res.status(200).send({
        data: {
          id_user: user.id_user,
          name: user.name,
          email: user.email,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          role: user.role,
        },
        token: token,
      });
    }
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

AuthController.updatePassword = (req, res) => {
  User.findOne({
    where: { id_user: req.user.id, status: true },
  }).then(async (user) => {
    try {
      if (!user) {
        return res.status(404).send({ message: 'El usuario no existe.' });
      } else {
        if (matchPassword(req.body.password, user.password)) {
          user.password = generateHash(req.body.new_password);
          await user.save();

          return res.status(200).send({ data: 1 });
        } else {
          return res.status(400).send({ message: 'Contraseña incorrecta.' });
        }
      }
    } catch (error) {
      console.log(err);
      return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
    }
  }).catch((err) => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

AuthController.generateNewPassword = async (req, res) => {
  const generated_password = randomPassword();
  const user = await User.findOne({ where: { email: req.body.email, status: true } });
  if (user) {
    User.update({
      password: generateHash(generated_password),
    }, {
      where: { email: req.body.email }
    }).then(user => {
      if (!user)
        return res.status(400).send({ message: 'The record could not be updated.' });

      if (process.env.NODE_ENV !== 'development') {
        transport.sendMail({
          from: '"Admin" <admin@email.com>',
          to: req.body.email,
          subject: "Nueva contraseña",
          html: '<div>Email: '+req.body.email+'<br>'+'Clave: '+generated_password
        }, (err, info) => {
          if (err) {
            console.log("ERROR: ", err);
            return res.status(200).send({ data: user.id_user });
          }
          console.log("INFO: ", info);
          return res.status(200).send({ data: user.id_user });
        });
      } else {
        return res.status(200).send({ data: user.id_user });
      }
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
  } else {
    return res.status(500).send({ message: 'El usuario no se encuentra registrado.' });
  }
}

module.exports = AuthController;