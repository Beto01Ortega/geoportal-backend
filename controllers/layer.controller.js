const { Layer, FileAccess } = require('../database');

const LayerController = {};

LayerController.getAll = (req, res) => {
  Layer.findAll({
    order: [['id_layer', 'ASC']],
    include: [
      { model: FileAccess },
    ] 
  }).then(categories => {
    return res.status(200).send(categories);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

LayerController.getRecord = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id },
    include: [
      { model: FileAccess },
    ] 
  }).then(layer => {
    return res.status(200).send(layer);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

LayerController.addRecord = (req, res) => {
  Layer.create({
    ...req.body,
    user_id: req.user.id
  })
    .then(layer => {
      if (!layer)
        return res.status(400).send({ message: 'The record could not be created.' });

      return res.status(200).send({ 
        ...layer.toJSON(),
        files: [],
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
};

LayerController.editRecord = (req, res) => {
  Layer.update(req.body, {
    where: { external_id: req.params.id }
  }).then(layer => {
    if (!layer)
      return res.status(400).send({ message: 'The record could not be updated.' });

    return res.status(200).send({ data: layer });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

LayerController.removeRecord = (req, res) => {
  Layer.destroy({
    where: { external_id: req.params.id }
  }).then(layer => {
    if (!layer)
      return res.status(400).send({ message: 'The record could not be deleted.' });

    return res.status(200).send({ data: layer });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

module.exports = LayerController;