const { Role } = require("../database");

const RoleController = {};

RoleController.getRoles = (req, res) => {
    Role.findAll({
        order: [['id_role', 'DESC']],
    }).then(roles => {
        return res.status(200).send(roles);
    }).catch(err => {
        console.log(err);
        return res.status(500).send({ message: 'An error occurred in the request.' });
    });
};

module.exports = RoleController;