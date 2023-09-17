const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, type) => {
  return sequelize.define('category', {
    id_category: {
      type: type.BIGINT(11),
      primaryKey: true,
      autoIncrement:true,
    },
    name: type.STRING,
    description: type.TEXT,
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