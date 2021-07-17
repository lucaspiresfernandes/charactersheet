const knex = require('knex')(
{
    client: 'mysql',
    connection: process.env.DATABASE_URL,
    asyncStackTraces: process.env.DEVELOPMENT || false,
    debug: process.env.DEVELOPMENT || false
});

module.exports = knex;