const { User, Role } = require('../database');
const { generateHash } = require('../lib/helpers');
const { transport } = require('../lib/mailer');

const { Op } = require('sequelize');

const UsersController = {};

UsersController.getUsers = (req, res) => {
  User.findAll({
    where: {
      id_user: {
        [Op.ne]: req.user.id,
      }
    },
    order: [
      ['created_at', 'DESC'],
    ],
    include: [
      { model: Role, as: 'role' }
    ],
  }).then(users => {
    return res.status(200).send(users);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

UsersController.getUser = (req, res) => {
  User.findOne({
    where: { external_id: req.params.id },
    include: [
      { model: Role, as: 'role' }
    ],
  }).then(user => {
    return res.status(200).send(user);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

UsersController.addUser = async (req, res) => {
  User.create({
    ...req.body,
    password: generateHash(req.body.password)
  }).then(async (user) => {
    if (!user)
      return res.status(400).send({ message: 'The record could not be created.' });

    if (process.env.NODE_ENV !== 'development') {
      transport.sendMail({
        from: '"Admin" <admin@email.com>',
        to: user.email,
        subject: "Cuenta generada",
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
    return res.status(500).send({ message: 'Ha ocurrido un error al guardar el usuario, posiblemente ya exista.' });
  });
};

UsersController.editUser = (req, res) => {
  User.update(req.body, {
    where: { id_user: req.params.id }
  }).then(user => {
    if (!user)
      return res.status(400).send({ message: 'The record could not be updated.' });

    return res.status(200).send({ data: user });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

UsersController.toggleStatus = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id_user: req.params.id } });
    user.status = !user.status;
    await user.save();
    return res.status(200).send({ data: 1 });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  }
};

UsersController.removeUser = (req, res) => {
  User.destroy({
    where: { id_user: req.params.id }
  }).then(user => {
    if (!user)
      return res.status(400).send({ message: 'The record could not be deleted.' });

    return res.status(200).send({ data: user });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

module.exports = UsersController;