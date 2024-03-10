const { UUIDV4 } = require("sequelize");

module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    id_user: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: type.STRING,
    institution: type.STRING,
    country: type.STRING,
    email: {
      type: type.STRING,
      unique: true,
      isEmail: true,
    },
    password: type.STRING,
    external_id: {
      type: type.UUID,
      defaultValue: UUIDV4,
    },
    status: {
      type: type.BOOLEAN,
      defaultValue: true
    },
  }, {
    scopes: {
      active: {
        where: {
          status: true,
        },
      },
      withoutPassword: {
        attributes: {
          exclude: ['password']
        },
      },
    },
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};