const { FileAccess } = require('../database');
const fs = require('fs');
const { v4 } = require('uuid');

const FileAccessController = {};

FileAccessController.getAllFiles = (req, res) => {
  FileAccess.findAll({
    order: [['id_file', 'ASC']],
  }).then(files => {
    return res.status(200).send(files);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

FileAccessController.getFileAccess = (req, res) => {
  FileAccess.findOne({
    where: { id_file: req.params.id },
  }).then(file => {
    return res.status(200).send(file);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

FileAccessController.addFileAccess = (req, res) => {
  if (req.files['zip'] && req.files['json']) {
    let zip = req.files['zip'][0];
    let json = req.files['json'][0];

    let exter1 = v4();
    let exten1 = zip.originalname.split(".").pop();
    let name1  = exter1 + "." + exten1;

    let exter2 = v4();
    let exten2 = json.originalname.split(".").pop();
    let name2 = exter2 + "." + exten2;

    let zip_name = name1;
    let json_name = name2;

    try {
      fs.renameSync(zip.destination + "/" + zip.filename, zip.destination + "/" + zip_name);
      fs.renameSync(json.destination + "/" + json.filename, json.destination + "/" + json_name);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });
    }

    const data = JSON.parse(req.body.fileProps);
    FileAccess.create({
      ...data,
      path_zip: zip_name,
      path_json: json_name,
    })
      .then(file => {
        if (!file)
          return res.status(400).send({ message: 'The record could not be created.' });

        return res.status(200).send(file);
      }).catch(err => {
        console.log('Error de REQUEST => ', err);
        return res.status(500).send({ message: 'An error occurred in the request.' });
      });
  } else {
    return res.status(400).send({ message: 'La solicitud no tiene uno o todos los archivos necesarios.' });
  }
};

FileAccessController.editFileAccess = (req, res) => {
  let zip_name = null;
  let json_name = null;
  
  if (req.files['zip']) {
    let zip = req.files['zip'][0];

    let exter1 = v4();
    let exten1 = zip.originalname.split(".").pop();
    let name1  = exter1 + "." + exten1;

    zip_name = name1;

    try {
      fs.renameSync(zip.destination + "/" + zip.filename, zip.destination + "/" + zip_name);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });
    }
  }

  if(req.files['json']) {
    let json = req.files['json'][0];

    let exter2 = v4();
    let exten2 = json.originalname.split(".").pop();
    let name2 = exter2 + "." + exten2;
    json_name = name2;

    try {
      fs.renameSync(json.destination + "/" + json.filename, json.destination + "/" + json_name);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });
    }

  }

  let data = JSON.parse(req.body.fileProps);
  
  if(zip_name)
    data.path_zip = zip_name;
  if(json_name)
    data.path_json = json_name;

  FileAccess.update({
    ...data
  }, {
    where: { external_id: req.params.id }
  }).then(file => {
    if (!file)
      return res.status(400).send({ message: 'The record could not be updated.' });

    return res.status(200).send({ response: file, zip: zip_name, json: json_name });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

FileAccessController.downloadFile = (req, res) => {
  const file = `${process.env.ROOT_DIR}/${req.params.path}`;
  res.download(file);
};

FileAccessController.removeFileAccess = (req, res) => {
  FileAccess.destroy({
    where: { external_id: req.params.id }
  }).then(file => {
    if (!file)
      return res.status(400).send({ message: 'The record could not be deleted.' });

    return res.status(200).send({ data: file });
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

module.exports = FileAccessController;