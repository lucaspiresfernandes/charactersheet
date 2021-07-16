const hbs = require('hbs');
const config = require('../config.json');

exports.registerHelpers = () =>
{
    hbs.registerHelper('rpgname', options =>
    {
        return config.info.rpgname;
    });
};