const knex = require('knex')(
    {
        client: 'mysql',
        connection: process.env.DATABASE_URL,
        asyncStackTraces: false,
        debug: false
    });

module.exports = knex;