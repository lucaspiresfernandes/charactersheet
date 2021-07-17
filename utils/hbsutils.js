const hbs = require('hbs');
const config = require('../config.json');

exports.registerHelpers = () =>
{
    hbs.registerHelper('rpgname', () => config.info.rpgname);
    hbs.registerHelper('playerrole', () => config.info.playerrole);
};