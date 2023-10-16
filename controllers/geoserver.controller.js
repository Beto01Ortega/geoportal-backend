const fs = require('fs');

const { instance } = require('../geoserver');
const { Layer } = require('../database');

const GeoServerController = {};

GeoServerController.publishShape = (req, res) => {
  Layer.findOne({
    where: { id_layer: req.params.id }, 
  }).then(layer => {  
    if(!layer.published) {
      instance.post('/workspaces/Ecuador/datastores', {
        dataStore: {
          name: layer.name,
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
        let filen = layer.filename.split(".")[0];
        instance.post(`/workspaces/Ecuador/datastores/${layer.name}/featuretypes`, {
          featureType: {
            name: layer.external_id,
            nativeName: filen,
          }
        }).then(async (response) => {      
          layer.published = true;
          await layer.save();
          if(layer.styles) {
            let styles_name = layer.name.replace(/\s/g, "");
            let styles_uuid = layer.styles.split(".");

            var stylesFile = null

            try {
              stylesFile = fs.readFileSync(`${process.env.ROOT_SHP}/${styles_uuid[0]}/${layer.styles}`, 'utf-8');              
            } catch (error) {
              console.log(error);
            } 

            if(stylesFile) {
              instance.post(`/styles?name=${styles_name}_style`, stylesFile, {
                headers: {
                  'Content-Type': 'application/vnd.ogc.se+xml'
                }
              }).then(response => {
                  instance.post(`/layers/${layer.external_id}/styles?default=true`, {
                    style: {
                      name: `${styles_name}_style`,
                    },
                  }).then(response => {
                    console.log("**** ESTILOS PUBLICADOS ****")
                    console.log(response.data);
                  }).catch(err => {
                    console.log("STYLES ERROR =>", err);
                  });
              }).catch(err => {
                console.log("STYLES ERROR =>", err);
              });
            }
          }
          return res.status(200).send(response.data);
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ 
            message: 'An error occurred in the request.',
            data: err.data,
          });
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ 
          message: 'An error occurred in the request.',
          data: err.data,
        });
      });
    } else {
      return res.status(400).send({ 
        message: 'Capa ya publicada.',
        data: err.data,
      });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
}

GeoServerController.publishRaster = (req, res) => {
  Layer.findOne({
    where: { id_layer: req.params.id }, 
  }).then(layer => {
    if(!layer.published) {
      instance.post('/workspaces/Ecuador/coveragestores', {
        coverageStore: {
          name: layer.name,
          workspace: {
            name: 'Ecuador'
          },
          enabled: true,
          type: 'GeoTIFF',
          url: `file://${process.env.ROOT_SHP}/${layer.folderpath}/${layer.filename}`,
        }
      }).then(response => {
        let filen = layer.filename.split(".")[0];
        instance.post(`/workspaces/Ecuador/coveragestores/${layer.name}/coverages`, {
          coverage: {
            name: layer.external_id,
            nativeName: filen,
          }
        }).then(async (response) => {      
          layer.published = true;
          await layer.save();
          return res.status(200).send(response.data);
        }).catch(err => {
          console.log(err);
          return res.status(500).send({ 
            message: 'An error occurred in the request.',
            data: err.data,
          });
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).send({ 
          message: 'An error occurred in the request.',
          data: err.data,
        });
      });
    } else {
      return res.status(400).send({ 
        message: 'Capa ya publicada.',
        data: err.data,
      });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).send({ message: 'An error occurred in the request.' });
  });
}

module.exports = GeoServerController;