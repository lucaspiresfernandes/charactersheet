const encrypter = require('../utils/encrypter');
const express = require('express');
const router = express.Router();
const con = require('../utils/connection');
const bodyParser = require('body-parser');
const urlParser = bodyParser.urlencoded(
{
    extended: false
});

router.get('/', (req, res) =>
{
    res.render('login');
});

router.post('/', urlParser, async(req, res) =>
{
    try
    {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password)
            return res.status(400).send('Usuário ou senha não foram processados corretamente.');

        let result = await con.select('player.player_id', 'player.password', 'player.admin')
        .from('player')
        .where('username', username)
        .first();

        if (!result)
            return res.status(401).send('Usuário ou senha incorretos.');

        let hashword = result.password;
        let id = result.player_id;
        let admin = result.admin;
        let exists = await encrypter.compare(password, hashword);

        if (!exists)
            return res.status(401).send('Usuário ou senha incorretos.');

        if (admin)
            req.session.adminID = id;
        else 
            req.session.playerID = id;

        res.send({admin});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send({err});
    }
});

module.exports = router;