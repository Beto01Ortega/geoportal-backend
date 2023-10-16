const { Category, Layer, User } = require('../database');

const CategoryController = {};

CategoryController.getAll = (req, res) => {
  Category.findAll({
    where: { parent_id: null },
    order: [
      ['id_category', 'ASC'],
      ['layers', 'id_layer', 'ASC'],
    ],
    include: [
      { model: User, as: 'user' },
      { model: Category },
      { model: Layer },
    ],
  }).then(categories => {
    return res.status(200).send(categories);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

CategoryController.getAllSub = (req, res) => {
  Category.findAll({
    where: {
      parent_id: req.params.id
    },
    order: [['id_category', 'ASC']],
  }).then(categories => {
    return res.status(200).send(categories);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

CategoryController.getRecord = (req, res) => {
  Category.findOne({
    where: { external_id: req.params.id },
    order: [
      ['layers', 'id_layer', 'ASC'],
    ],
    include: [
      { model: Category },
      { model: Layer },
    ],
  }).then(category => {
    return res.status(200).send(category);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

CategoryController.addRecord = (req, res) => {
  Category.create({
    ...req.body,
    user_id: req.user.id
  })
    .then(async (category) => {
      if (!category)
        return res.status(400).send({ message: 'The record could not be created.' });

      var usr = null;
      try {
        usr = await category.getUser();
      } catch (error) {
        console.log(error);
      }

      return res.status(200).send({ 
        ...category.toJSON(), 
        user: usr.toJSON(), 
        categories: [],
        layers: [],
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
};

CategoryController.editRecord = (req, res) => {
  Category.update(req.body, {
    where: { external_id: req.params.id }
  }).then(category => {
    if (!category)
      return res.status(400).send({ message: 'The record could not be updated.' });

    return res.status(200).send({ data: category });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

CategoryController.removeRecord = (req, res) => {
  Category.destroy({
    where: { external_id: req.params.id }
  }).then(category => {
    if (!category)
      return res.status(400).send({ message: 'The record could not be deleted.' });

    return res.status(200).send({ data: category });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

module.exports = CategoryController;