const encrypter = require('../utils/encrypter');
const con = require('../database/connection');
const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
var urlParser = bodyParser.urlencoded({extended:false});
const config = require('../config.json');

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
    let username = req.body.username;
    let password = req.body.password;
    
    if (!username || !password)
        return res.status(400).send('Usuário ou senha não foram processados corretamente.');

    let adminKey = parseInt(req.body.adminKey);
    
    let results = await con.select('login').from('player').where('login', username).first();

    if (results)
        return res.status(403).send('Esse usuário já existe.');

    let type = 'player';

    if (!(isNaN(adminKey)))
    {
        results = await con.select().from('admin_key').first();
        console.log('ORIGINAL ADMIN KEY: ' + results);
        let originalAdminKey = parseInt(results.id);
        
        if (originalAdminKey === adminKey)
            type = 'admin';
        else
            return res.status(401).send('Chave de administrador não é válida.');
    }
    
    let hash = await encrypter.encrypt(password);
    
    const sub = con.select('player_type_id').from('player_type').where('name', type).first();
    
    await con.insert({player_type_id: sub, login: username, password: hash}).into('player');

    if (type === 'player')
    {
        const id = await con.select('player_id').from('player').where('login', username).first();
        registerPlayerData(id.player_id);
    }
    
    res.send('Conta criada com sucesso!');
}

function registerPlayerData(playerID)
{
    con.select('characteristic_id').from('characteristic').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const characteristicID = results[i];
            con.insert({player_id: playerID, characteristic_id: characteristicID.characteristic_id, value: 0})
            .into('player_characteristic').then(() => {});
        }
    });

    con.select('attribute_id').from('attribute').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const attributeID = results[i];
            con.insert({player_id: playerID, attribute_id: attributeID.attribute_id, value: 0})
            .into('player_attribute').then(() => {});
        }
    });

    con.select('attribute_status_id').from('attribute_status').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const attributeStatusID = results[i];
            con.insert({player_id: playerID, attribute_status_id: attributeStatusID.attribute_status_id, value: false})
            .into('player_attribute_status').then(() => {});
        }
    });

    con.select('skill_id', 'start_value', 'mandatory').from('skill').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const skill = results[i];

            if (!skill.mandatory)
                continue;
            
            con.insert({player_id: playerID, skill_id: skill.skill_id, value: skill.start_value, checked: false})
            .into('player_skill').then(() => {});
        }
    });

    con.select('spec_id').from('spec').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const spec_id = results[i].spec_id;
            con.insert({player_id: playerID, spec_id, value: 0})
            .into('player_spec').then(() => {});
        }
    });

    con.select('info_id').from('info').then(results =>
    {
        for (let i = 0; i < results.length; i++)
        {
            const info_id = results[i].info_id;
            con.insert({player_id: playerID, info_id, value: ''})
            .into('player_info').then(() => {});
        }
    });
    
    const subquery = con.select('equipment_id').from('equipment').where('equipment.name', 'Desarmado').first();
    con.insert({equipment_id: subquery, player_id: playerID, using: false, current_ammo: '-'}).into('player_equipment').then(() => {});
}

module.exports = router;