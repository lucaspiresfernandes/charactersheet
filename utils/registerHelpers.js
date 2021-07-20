const hbs = require('hbs');
const config = require('../config.json');

module.exports = () =>
{
    hbs.registerHelper('rpgname', () => config.info.rpgname);
    hbs.registerHelper('playerrole', () => config.info.playerrole);
};