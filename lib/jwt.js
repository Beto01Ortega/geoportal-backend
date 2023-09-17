const jwt       = require('jwt-simple');
const moment    = require('moment');

exports.createToken = function(user) {
    const payload = {
        id: user.id_user,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix,
    };

    return jwt.encode(payload, process.env.TOKEN_SECRET);
}