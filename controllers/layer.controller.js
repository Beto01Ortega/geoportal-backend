const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const { Layer } = require('../database');
const { v4 } = require('uuid');

const LayerController = {};

LayerController.getAll = (req, res) => {
  Layer.findAll({
    order: [['id_layer', 'ASC']], 
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
  }).then(layer => {
    return res.status(200).send(layer);
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
};

LayerController.addLayerShapes = (req, res) => {
  if(req.files['file']) {
    let zip = req.files['file'][0];

    let external = v4();
    let extension = zip.originalname.split(".").pop();
    const filename  = external + "." + extension;

    var stylesfile = null;
    if(req.files['styles']) {
      let styles = req.files['styles'][0];
      
      let externalStyles = v4();
      let extensionStyles = styles.originalname.split(".").pop();; 
      stylesfile = externalStyles + "." + extensionStyles;

      try {
        fs.renameSync(styles.destination + "/" + styles.filename, styles.destination + "/" + stylesfile);
        fs.mkdirSync(`${process.env.ROOT_SHP}/${externalStyles}`);
        fs.copyFileSync(styles.destination + "/" + stylesfile, `${process.env.ROOT_SHP}/${externalStyles}/${stylesfile}`)
      } catch (error) {
        console.log(error);
      }
    }

    try {
      fs.renameSync(zip.destination + "/" + zip.filename, zip.destination + "/" + filename);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });
    }

    const zipFile = new AdmZip(`${zip.destination}/${filename}`);
    const zipEntries = zipFile.getEntries();

    let shpFileName = null;
    for (const entry of zipEntries) {
      if (path.extname(entry.entryName) === '.shp') {
        shpFileName = entry.entryName;
        break;
      }
    };

    var shpfile = null;

    if (shpFileName) {
      zipFile.extractAllTo(`${process.env.ROOT_SHP}/${external}`, true);

      if(shpFileName.includes("/")) {
        let split = shpFileName.split('/');
        let foldername = split[0];
        let files = [];

        shpfile = split[split.length - 1];

        try {
          files = fs.readdirSync(`${process.env.ROOT_SHP}/${external}/${foldername}`);          
        } catch (error) {
          console.log(error);
          return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });          
        }      

        for(let file of files) {
          const sourceFilePath = path.join(`${process.env.ROOT_SHP}/${external}/${foldername}`, file);
          const destinationFilePath = path.join(`${process.env.ROOT_SHP}/${external}`, file);

          try {
            fs.renameSync(sourceFilePath, destinationFilePath);            
          } catch (error) {
            console.log(error);
            return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });                
          }
        }
      } else {
        shpfile = shpFileName;
      }

      // Procesar datos de la capa
      const data = JSON.parse(req.body.fileProps);
      Layer.create({
        ...data,
        filename: shpfile,  // para el nombre nativo del geoserver
        filepath: filename, // para descargar
        folderpath: `${external}/${shpFileName}`, // para publicar en el geoserver
        styles: stylesfile, // para los estilos en geoserver
        published: false,
      }).then(layer => {
        if (!layer)
          return res.status(400).send({ message: 'The record could not be created.' });

        // return res.status(200).send({ message: `Archivo ZIP subido y archivo .shp (${shpFileName}) descomprimido en la carpeta "geodata".`});
        return res.status(200).send(layer);

      }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'An error occurred in the request.' });
      });

    } else {
      return res.status(400).send({ message: 'No se encontró ningún archivo .shp en el archivo comprimido.'});
    }
  } else {    
    return res.status(400).send({ message: 'La solicitud no tiene el archivo comprimido.' });
  }
};

LayerController.addLayerRaster = (req, res) => {
  if(req.file) {
    let tif = req.file;

    const external = v4();
    let extension = tif.originalname.split(".").pop();
    const filename  = external + "." + extension;

    try {
      fs.renameSync(tif.destination + "/" + tif.filename, tif.destination + "/" + filename);
      fs.mkdirSync(`${process.env.ROOT_SHP}/${external}`);
      fs.copyFileSync(tif.destination + "/" + filename, `${process.env.ROOT_SHP}/${external}/${filename}`)
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: 'No se ha podido almacenar el archivo.' });
    }

    // Procesar datos del raster
    const data = JSON.parse(req.body.fileProps);
    Layer.create({
      ...data,
      filename: filename, // para el nombre nativo del geoserver
      filepath: filename, // para descargar
      folderpath: external, // para publicar en el geoserver
      published: false,
    }).then(layer => {
      if (!layer)
        return res.status(400).send({ message: 'The record could not be created.' });
    
      // return res.send({ message: `Archivo TIF subido y copiado a la carpeta "geodata".`});
      return res.status(200).send(layer);
    }).catch(err => {
      console.log(err);
      return res.status(500).send({ message: 'An error occurred in the request.' });
    });
  } else {    
    return res.status(400).send({ message: 'La solicitud no tiene el archivo comprimido.' });
  }
}

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

LayerController.downloadFile = (req, res) => {
  const file = `${process.env.ROOT_DIR}/${req.params.path}`;
  res.download(file);
};

module.exports = LayerController;