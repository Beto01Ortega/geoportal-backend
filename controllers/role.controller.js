const { Role } = require("../database");

const RoleController = {};

RoleController.getRoles = (req, res) => {
    if(req.user?.role?.name === 'admin') {
        Role.findAll({
            order: [['id_role', 'DESC']],
        }).then(roles => {
            return res.status(200).send(roles);
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
        });
    } else {
        return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
    }
};

RoleController.addRole = (req, res) => {
    if(req.user?.role?.name === 'admin') {
        Role.create({
            name: req.body.name,
        }).then(role => {
            return res.status(200).send({ message: 'Creado correctamente.' });
        }).catch(err => {
            console.log(err);
            return res.status(500).send({ message: 'Ha ocurrido un error al procesar la solicitud.' });
        });
    } else {
        return res.status(403).send({ message: 'Acción no permitida para este usuario.' });
    }
}

module.exports = RoleController;