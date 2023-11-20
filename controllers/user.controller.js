const { User, Role } = require('../database');
const { generateHash } = require('../lib/helpers');

const { Op } = require('sequelize');

const UsersController = {};

UsersController.getUsers = (req, res) => {
  if(req.user?.role?.name === 'admin') {
    User.findAll({
      attributes: {
        exclude: ['password'],
      },
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
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
  
};

UsersController.getUser = (req, res) => {
  if(req.user?.role?.name === 'admin') {
    User.findOne({
      attributes: {
        exclude: ['password'],
      },
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
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
};

UsersController.addUser = async (req, res) => {
  if(req.user?.role?.name === 'admin') {
    User.create({
      ...req.body,
      password: generateHash(req.body.password)
    }).then(async (user) => {
      if (!user)
        return res.status(400).send({ message: 'The record could not be created.' });
  
      return res.status(200).send({ data: user.id_user });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'Ha ocurrido un error al guardar el usuario, posiblemente ya exista.' });
    });
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
};

UsersController.editUser = (req, res) => {
  if(req.user?.role?.name === 'admin') {
    User.update(req.body, {
      where: { external_id: req.params.id }
    }).then(user => {
      if (!user)
        return res.status(400).send({ message: 'The record could not be updated.' });
  
      return res.status(200).send({ data: user });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
};

UsersController.toggleStatus = async (req, res) => {
  if(req.user?.role?.name === 'admin') {
    try {
      const user = await User.findOne({ where: { external_id: req.params.id } });
      user.status = !user.status;
      await user.save();
      return res.status(200).send({ data: 1 });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    }
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
};

UsersController.removeUser = (req, res) => {
  if(req.user?.role?.name === 'admin') {
    User.destroy({
      where: { external_id: req.params.id }
    }).then(user => {
      if (!user)
        return res.status(400).send({ message: 'The record could not be deleted.' });
  
      return res.status(200).send({ data: user });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
  } else {
    return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
  }
};

module.exports = UsersController;