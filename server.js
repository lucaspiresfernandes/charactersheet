const express = require('express');
const http = require('http');
const path = require('path');
const hbsutils = require('./utils/hbsutils');
const session = require('express-session');
const { Server } = require('socket.io');
const hbs = require('hbs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 80;

const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');
const publicPath = path.join(__dirname, './public');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);
app.use(express.static(publicPath));
app.use(session({secret: process.env.EXPRESS_SESSION_SECRET, resave: false, saveUninitialized: false}));

hbsutils.registerHelpers();

module.exports.io = io;

//Routes
const login = require('./routes/login');
const register = require('./routes/register');
const sheet = require('./routes/sheet');
const admin = require('./routes/admin');
const dice = require('./routes/dice');
const avatar = require('./routes/avatar');
//End Routes

app.get('/', (req, res) =>
{
    res.render('home');
});

app.use('/register', register);
app.use('/login', login);
app.use('/sheet', sheet);
app.use('/admin', admin);
app.use('/dice', dice);
app.use('/avatar', avatar);

app.get('*', (req, res) =>
{
    res.status(404).send('Not Found');
});

module.exports.start = () =>
{
    server.listen(port, () =>
    {
        console.log(`Listening to port ${port}...`);
    });
};