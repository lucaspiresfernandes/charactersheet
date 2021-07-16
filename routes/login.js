const encrypter = require('../utils/encrypter');
const express = require('express');
const con = require('../database/connection');
const bodyParser = require('body-parser');
const urlParser = bodyParser.urlencoded({extended:false});
const router = express.Router();
const config = require('../config.json');

router.get('/', (req, res) =>
{
    res.render('login');
});

router.post('/', urlParser, async (req, res) =>
{
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password)
        return res.status(400).send('Usuário ou senha não foram processados corretamente.');
    
    let result = await con.select('player.player_id', 'player.password', 'player_type.name')
    .from('player')
    .join('player_type', 'player.player_type_id', 'player_type.player_type_id')
    .where('login', username)
    .first();

    if (!result)
        return res.status(401).send('Login ou senha incorretos.');

    let hashword = result.password;
    let id = result.player_id;
    let exists = await encrypter.compare(password, hashword);

    if (!exists)
        return res.status(401).send('Login ou senha incorretos.');
    
    res.send({playerID: id});
});

module.exports = router;