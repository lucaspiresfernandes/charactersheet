const hbs = require('hbs');
const config = require('../config.json');

module.exports = () => {
    hbs.registerHelper('rpgname', () => config.info.rpgname);
    hbs.registerHelper('playerrole', () => config.info.playerrole);
    hbs.registerHelper('ifEquals', function (arg1, arg2, options) {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
};