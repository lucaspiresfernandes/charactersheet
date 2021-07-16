const express = require('express');
const http = require('http');
const path = require('path');
const config = require('./config.json');
const hbsutils = require('./utils/hbsutils');

const app = express();
const server = http.createServer(app);
//const io = new Server(server);
const port = process.env.PORT || 80;

const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');
const publicPath = path.join(__dirname, './public');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
app.set('partials', partialsPath);
app.use(express.static(publicPath));

hbsutils.registerHelpers();

//Routes
const login = require('./routes/login');
const register = require('./routes/register');
//End Routes

app.get('/', (req, res) =>
{
    res.render('home');
});

app.use('/register', register);
app.use('/login', login);

app.get('*', (req, res) =>
{
    res.status(404).send('Not Found');
});

exports.start = () =>
{
    server.listen(port, () =>
    {
        console.log(`Listening to port ${port}...`);
    });
};