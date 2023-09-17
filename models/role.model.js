const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, type) => {
  return sequelize.define('role', {
      id_role: {
          type: type.BIGINT(11),
          primaryKey: true,
          autoIncrement:true,
      },
      name: type.STRING,
      external_id: {
        type: type.UUID,
        defaultValue: UUIDV4,
      },
  },{
      scopes: {
          withoutFields:{
              attributes: { 
                  exclude: ['id_role', 'created_at','updated_at'],
              },
          }
      },
      createdAt:'created_at',
      updatedAt:'updated_at',
  });
};