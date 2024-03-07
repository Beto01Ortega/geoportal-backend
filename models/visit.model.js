module.exports = (sequelize, type) => {
  return sequelize.define('visit', {
    id_visit: {
      type: type.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    ip: {
      type: type.STRING,
      unique: true,
    },
    ip_ver: type.SMALLINT,
    country_name: type.STRING,
    country_code: type.STRING,
    visit_count: {
      type: type.INTEGER,
      defaultValue: 1      
    },
  },{
    createdAt:'created_at',
    updatedAt:'updated_at',
  });
}