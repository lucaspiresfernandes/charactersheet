const util = require('util');
const bcrypt = require('bcrypt');
const saltRounds = require('../config.json').encryption.saltRounds;

function encrypt(password, callback) {
    bcrypt.hash(password, saltRounds, (err, hash) => {
        return callback(err, hash);
    });
};

function compare(plainPass, hashword, callback) {
    bcrypt.compare(plainPass, hashword, (err, isPasswordMatch) => {
        return err == null ?
            callback(null, isPasswordMatch) :
            callback(err);
    });
}

module.exports.encrypt = password => {
    return util.promisify(encrypt).call(encrypt, password);
};

module.exports.compare = (plainPass, hashword) => {
    return util.promisify(compare).call(compare, plainPass, hashword);
};