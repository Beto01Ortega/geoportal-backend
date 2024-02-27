const { Sequelize, DataTypes } = require('sequelize');
const { generateHash } = require('./lib/helpers');

const RoleModel     = require('./models/role.model');
const UserModel     = require('./models/user.model');
const CategoryModel = require('./models/category.model');
const LayerModel    = require('./models/layer.model');
const ActivityModel = require('./models/activity.model');

const VisitModel = require('./models/visit.model');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_TYPE,
    port: process.env.DB_PORT,
  }
);

const Role       = RoleModel(sequelize, DataTypes);
const User       = UserModel(sequelize, DataTypes);
const Category   = CategoryModel(sequelize, DataTypes);
const Layer      = LayerModel(sequelize, DataTypes);
const Activity   = ActivityModel(sequelize, DataTypes);
const Visit      = VisitModel(sequelize, DataTypes);

// Definición de relaciones
Role.hasMany(User, { as: 'users', onDelete: 'CASCADE', foreignKey: 'role_id' });
User.belongsTo(Role, { as: 'role', foreignKey: 'role_id' });

User.hasMany(Category, { onDelete: 'CASCADE', foreignKey: 'user_id' });
Category.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

User.hasMany(Activity, { onDelete: 'CASCADE', foreignKey: 'user_id' });
Activity.belongsTo(User, { as: 'user', foreignKey: 'user_id' });

Category.hasMany(Layer, { onDelete: 'CASCADE', foreignKey: 'category_id' });
Layer.belongsTo(Category, { as: 'category', foreignKey: 'category_id' });

Category.hasMany(Category, { onDelete: 'CASCADE', foreignKey: 'parent_id' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parent_id' });

(async () => {
  await sequelize.sync();
  console.log('\n*********************************************');
  console.log('DB is connected ===> schema: public');
  console.log('*********************************************\n');

  try {
    const roles = await Role.findAll();
    if (roles.length === 0) {
      const role = await Role.create({
        name: 'admin',
      });

      await Role.create({
        name: 'user',
      });

      await Role.create({
        name: 'visitor',
      });

      await User.create({
        name: 'Geoportal-Admin',
        email: 'admin@localhost.com',
        password: generateHash('admin_pass'),
        role_id: role.id_role,
      });
    }
  } catch (err) {
    console.log("ERROR! ", err);    
  }
})();

module.exports = {
  sequelize,
  Role,
  User,
  Category,
  Layer,
  Activity,
  Visit,
};