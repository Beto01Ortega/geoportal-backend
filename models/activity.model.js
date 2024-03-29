module.exports = (sequelize, type) => {
  return sequelize.define('activity', {
    id_activity: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement:true,
    },
    action: type.STRING,
    url: type.STRING,
  },{
    createdAt:'created_at',
    updatedAt:'updated_at',
  });
};