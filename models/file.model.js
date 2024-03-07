const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, type) => {
  return sequelize.define('file', {
    id_file: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement:true,
    },
    name: type.STRING,
    type: type.STRING,
    path_zip: type.TEXT,
    path_json: type.TEXT,
    properties: type.JSONB,
    legends: type.JSONB,
    extent: type.JSONB,
    status: { 
      type: type.BOOLEAN, 
      defaultValue: true,
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