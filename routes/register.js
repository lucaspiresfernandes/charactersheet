const encrypter = require('../utils/encrypter');
const con = require('../utils/connection');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
var urlParser = bodyParser.urlencoded(
{
    extended: false
});

router.get('/', (req, res) =>
{
    res.render('register');
});

router.get('/admin', (req, res) =>
{
    res.render('register',
    {
        admin: true
    });
})

router.post('/', urlParser, registerPost);

router.post('/admin', urlParser, registerPost);

async function registerPost(req, res)
{
    try
    {
        let username = req.body.username;
        let password = req.body.password;

        if (!username || !password)
            return res.status(400).send('Usuário ou senha não foram processados corretamente.');

        let adminKey = parseInt(req.body.adminKey);

        let results = await con.select('username').from('player').where('username', username).first();

        if (results)
            return res.status(401).send('Esse usuário já existe.');

        let admin = false;

        if (!(isNaN(adminKey)))
        {
            results = await con.select().from('admin_key').first();
            let originalAdminKey = parseInt(results.key);

            if (originalAdminKey === adminKey)
                admin = true;
            else
                return res.status(401).send('Chave de administrador não é válida.');
        }

        let hash = await encrypter.encrypt(password);
        
        await con.insert(
        {
            username: username,
            password: hash,
            admin: admin
        }).into('player');

        if (!admin)
        {
            const id = await con.select('player_id').from('player').where('username', username).first();
            registerPlayerData(id.player_id);
        }

        res.send('Conta criada com sucesso!');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send({err});
    }
}

function registerPlayerData(playerID)
{
    con.select('characteristic_id').from('characteristic').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const characteristicID = results[i];
            con.insert(
                {
                    player_id: playerID,
                    characteristic_id: characteristicID.characteristic_id,
                    value: 0
                })
                .into('player_characteristic').then(() =>
                {});
        }
    });

    con.select('attribute_id').from('attribute').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const attributeID = results[i];
            con.insert(
                {
                    player_id: playerID,
                    attribute_id: attributeID.attribute_id,
                    value: 0
                })
                .into('player_attribute').then(() =>
                {});
        }
    });

    con.select('attribute_status_id').from('attribute_status').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const attributeStatusID = results[i];
            con.insert(
                {
                    player_id: playerID,
                    attribute_status_id: attributeStatusID.attribute_status_id,
                    value: false
                })
                .into('player_attribute_status').then(() =>
                {});
        }
    });

    con.select('skill_id', 'start_value', 'mandatory').from('skill').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const skill = results[i];

            if (!skill.mandatory)
                continue;

            con.insert(
                {
                    player_id: playerID,
                    skill_id: skill.skill_id,
                    value: skill.start_value,
                    checked: false
                })
                .into('player_skill').then(() =>
                {});
        }
    });

    con.select('spec_id').from('spec').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const spec_id = results[i].spec_id;
            con.insert(
                {
                    player_id: playerID,
                    spec_id,
                    value: 0
                })
                .into('player_spec').then(() =>
                {});
        }
    });

    con.select('info_id').from('info').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const info_id = results[i].info_id;
            con.insert(
                {
                    player_id: playerID,
                    info_id,
                    value: ''
                })
                .into('player_info').then(() =>
                {});
        }
    });

    con.select('extra_info_id').from('extra_info').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const extra_info_id = results[i].extra_info_id;
            con.insert(
                {
                    player_id: playerID,
                    extra_info_id,
                    value: ''
                })
                .into('player_extra_info').then(() =>
                {});
        }
    });

    con.select('finances_id').from('finances').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const finances_id = results[i].finances_id;
            con.insert(
                {
                    player_id: playerID,
                    finances_id,
                    value: '$0'
                })
                .into('player_finances').then(() =>
                {});
        }
    });

    const subquery = con.select('equipment_id').from('equipment').where('equipment.name', 'Desarmado').first();
    con.insert(
    {
        equipment_id: subquery,
        player_id: playerID,
        using: false,
        current_ammo: '-'
    }).into('player_equipment').then(() =>
    {});
}

module.exports = router;