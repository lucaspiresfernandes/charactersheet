require('dotenv').config();
const server = require('./server');
require('./utils/connection');
server.start();