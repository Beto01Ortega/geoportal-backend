const fs = require('fs');
const logger = require('../logger');

const { instance } = require('../geoserver');
const { Layer } = require('../database');

const GeoServerController = {};


// FUNCIONES PARA VECTORES
GeoServerController.createDataStore = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id }, 
  }).then(layer => {
    if(!layer.published) {
      instance.post(`/workspaces/${process.env.GEOSERVER_WSPACE}/datastores`, {
        dataStore: {
          name: "ds_"+layer.external_id,
          connectionParameters: {
            entry: [
              {
                "@key":"url",
                "$":`file://${process.env.ROOT_SHP}/${layer.folderpath}`
              }
            ],        
          },
        }
      }).then(response => {
        return res.status(200).send(response.data);
      }).catch(err => {
        console.log(err.response)
        logger.error(err?.response?.data, { location: 'Geoserver - Data Store', url: err?.config?.url });
        return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
      });
    } else {
      return res.status(400).send({ message: 'La capa ya fue publicada.' });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
  });
}

GeoServerController.createShapeLayer = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id }, 
  }).then(layer => {
    if(!layer.published) {
      let filename = layer.filename.split(".")[0];
      instance.post(`/workspaces/${process.env.GEOSERVER_WSPACE}/datastores/ds_${layer.external_id}/featuretypes`, {
        featureType: {
          name: layer.external_id,
          nativeName: filename,
        }
      }).then(async (response) => {
        try {
          layer.published = true;
          await layer.save();
        } catch (error) {
          console.log("ERROR AL ACTUALIZAR CAPA LOCAL", error);
        }

        return res.status(200).send(response.data);
      }).catch(err => {
        console.log(err?.response);
        logger.error(err?.response?.data, { location: 'Geoserver - Shape Layers', url: err?.config?.url });
        return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.', error: err });
      });

    } else {
      return res.status(400).send({ message: 'La capa ya fue publicada.' });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.', error: err });
  });
}

GeoServerController.addStyles = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id }, 
  }).then(layer => {    
    if(layer.styles) {
      let styles_uuid = layer.styles.split(".");
      var stylesFile = null;

      try {
        stylesFile = fs.readFileSync(`${process.env.ROOT_SHP}/${styles_uuid[0]}/${layer.styles}`, 'utf-8');              
      } catch (error) {
        console.log(error);
      }
  
      if(stylesFile) {
        instance.post(`/styles?name=${styles_uuid[0]}_style`, stylesFile, {
          headers: {
            'Content-Type': layer.type == 'shapes' ? 'application/vnd.ogc.se+xml':'application/vnd.ogc.sld+xml' 
          }
        }).then(response => {
            instance.post(`/layers/${layer.external_id}/styles?default=true`, {
              style: {
                name: `${styles_uuid[0]}_style`,
              },
            }).then(response => {
              return res.status(200).send(response.data);
            }).catch(err => {
              return res.status(500).send({ message: 'Error al aplicar los estilos a la capa.', error: err });
            });
        }).catch(err => {          
          logger.error(err?.response?.data, { location: 'Geoserver - Shape Styles', url: err?.config?.url });
          return res.status(500).send({ message: 'Error al publicar los estilos.', error: err });
        });
      } else {
        return res.status(400).send({ message: 'No se encontró el archivo de estilos.' });
      }
    } else {
      return res.status(400).send({ message: 'La capa no tiene estilos adjuntos.' });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.', error: err });
  });
}

// FUNCIONES PARA RASTER
GeoServerController.createCoverageStore = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id }, 
  }).then(layer => {
    if(!layer.published) {
      instance.post(`/workspaces/${process.env.GEOSERVER_WSPACE}/coveragestores`, {
        coverageStore: {
          name: "cs_"+layer.external_id,
          workspace: {
            name: process.env.GEOSERVER_WSPACE
          },
          enabled: true,
          type: 'GeoTIFF',
          url: `file://${process.env.ROOT_SHP}/${layer.folderpath}/${layer.filename}`,
        }
      }).then(response => {        
        return res.status(200).send(response.data);
      }).catch(err => {
        console.log(err?.response);
        logger.error(err?.response?.data, { location: 'Geoserver - Coverage Store', url: err?.config?.url });

        return res.status(500).send({ 
          message: 'Ha ocurrido un error al procesar la solicitud.',
          error: err,
        });
      });
    } else {
      return res.status(400).send({ message: 'La capa ya fue publicada.' });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.', error: err });
  });
}

GeoServerController.createRasterLayer = (req, res) => {
  Layer.findOne({
    where: { external_id: req.params.id }, 
  }).then(layer => {
    let filename = layer.filename.split(".")[0];
    instance.post(`/workspaces/${process.env.GEOSERVER_WSPACE}/coveragestores/cs_${layer.external_id}/coverages`, {
      coverage: {
        name: layer.external_id,
        nativeName: filename,
      }
    }).then(async (response) => {
      try {
        layer.published = true;
        await layer.save();
      } catch (error) {
        console.log("ERROR AL ACTUALIZAR CAPA LOCAL", error);
      }
      
      return res.status(200).send(response.data);
    }).catch(err => {
      console.log(err);
      logger.error(err?.response?.data, { location: 'Geoserver - Raster Layer', url: err?.config?.url });

      return res.status(500).send({ 
        message: 'Ha ocurrido un error al procesar la solicitud.',
        data: err.data,
      });
    });    
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.', error: err });
  });
}

module.exports = GeoServerController;