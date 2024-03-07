const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, type) => {
  return sequelize.define('layer', {
    id_layer: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement:true,
    },
    name: type.STRING,
    type: type.STRING,
    legends: type.JSONB,
    filename: type.STRING,
    filepath: type.STRING,
    folderpath: type.STRING,
    styles: type.STRING,
    description: type.TEXT,
    published: { 
      type: type.BOOLEAN, 
      defaultValue: false 
    },
    status: { 
      type: type.BOOLEAN, 
      defaultValue: true 
    },
    external_id: {
      type: type.UUID,
      defaultValue: UUIDV4,
    },
  },{
    createdAt:'created_at',
    updatedAt:'updated_at',
  });
};