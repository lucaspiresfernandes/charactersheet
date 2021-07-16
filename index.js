require('dotenv').config();
const server = require('./server');
require('./database/connection');
server.start();