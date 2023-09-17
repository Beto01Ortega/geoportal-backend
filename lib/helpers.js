const { genSaltSync, hashSync, compareSync } = require('bcryptjs');

const salt = genSaltSync(10);

const generateHash = function (password) {
    return hashSync(password, salt);
};

const matchPassword = function(userPassword, password){
    return compareSync(userPassword, password);
};

module.exports = { generateHash, matchPassword };