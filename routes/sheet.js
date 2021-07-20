const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const con = require('../utils/connection');
const io = require('../server').io;
var urlParser = bodyParser.urlencoded({extended: false});

const handlebars = require('hbs').handlebars;

//#region routes

router.get('/1', async (req, res) =>
{
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID de jogador não foi detectado. Você esqueceu de logar?' });

    const queries =
    [
        //Info: 0
        con.select('info.*', 'player_info.value')
        .from('info')
        .join('player_info', 'info.info_id', 'player_info.info_id')
        .where('player_info.player_id', playerID),

        //Avatar: 1
        con.select('avatar.*', 'player_avatar.link')
        .from('avatar')
        .join('player_avatar', 'avatar.avatar_id', 'player_avatar.avatar_id')
        .where('player_avatar.player_id', playerID),

        //Attributes and Attribute Status: 2
        new Promise(async (resolve, reject) =>
        {
            const attrQuery = await con.select('attribute.*', 'player_attribute.value', 'player_attribute.max_value', 
            'attribute_status.attribute_status_id', 'attribute_status.name as attribute_status_name', 
            'player_attribute_status.value as player_attribute_status_value')
            .from('attribute')
            .join('player_attribute', 'attribute.attribute_id', 'player_attribute.attribute_id')
            .leftJoin('attribute_status', 'attribute_status.attribute_id', 'attribute.attribute_id')
            .leftJoin('player_attribute_status', 'player_attribute_status.attribute_status_id', 'attribute_status.attribute_status_id')
            .where('player_attribute.player_id', playerID).catch(reject);

            const attributeMap = new Map();
            const includedIDs = [];

            for (let i = 0; i < attrQuery.length; i++)
            {
                const attr = attrQuery[i];
                const attrID = attr.attribute_id;

                const attrStatusName = attr.attribute_status_name;
                const attrStatusValue = attr.player_attribute_status_value;
                const attrStatusID = attr.attribute_status_id;

                const statusObj =
                {
                    attribute_status_id: attrStatusID,
                    name: attrStatusName,
                    checked: attrStatusValue === 1 ? true: false
                }

                if (includedIDs.includes(attrID))
                {
                    if (attrStatusName)
                        attributeMap.get(attrID).status.push(statusObj);
                    continue;
                }

                let cur = attr.value;
                let max = attr.max_value;
                if (cur === 0)
                    attr.coeficient = 0;
                else
                    attr.coeficient = (cur / max) * 100;

                const status = attr.status = [];

                if (attrStatusID)
                    status.push(statusObj);

                delete attr.attribute_status_name;
                delete attr.player_attribute_status_value;

                attributeMap.set(attrID, attr);
                includedIDs.push(attrID);
            }

            const attributes = Array.from(attributeMap.values());
            attributes.sort((a, b) => a.attribute_id - b.attribute_id);

            resolve(attributes);
        }),
            
        //Specs: 3
        con.select('spec.*', 'player_spec.value')
        .from('spec')
        .join('player_spec', 'spec.spec_id', 'player_spec.spec_id')
        .where('player_spec.player_id', playerID),
        
        //Characteristics: 4
        con.select('characteristic.*', 'player_characteristic.value')
        .from('characteristic')
        .join('player_characteristic', 'characteristic.characteristic_id', 'player_characteristic.characteristic_id')
        .where('player_characteristic.player_id', playerID),

        //Player Equipments: 5
        con.select('equipment.*', 'skill.name as skill_name', 'player_equipment.using', 'player_equipment.current_ammo')
        .from('equipment')
        .join('skill', 'equipment.skill_id', 'skill.skill_id')
        .join('player_equipment', 'equipment.equipment_id', 'player_equipment.equipment_id')
        .where('player_equipment.player_id', playerID),

        //Available Equipments: 6
        con.select('equipment_id', 'name')
        .from('equipment')
        .whereNotIn('equipment_id', con.select('equipment_id').from('player_equipment').where('player_id', playerID))
        .orderBy('name'),

        //Skills: 7
        new Promise(async (resolve, reject) =>
        {
            const skills = await con.select('skill.skill_id', 'skill.name', 'player_skill.value', 'player_skill.checked', 'specialization.name as specialization_name')
            .from('skill')
            .join('player_skill', 'skill.skill_id', 'player_skill.skill_id')
            .leftJoin('specialization', 'specialization.specialization_id', 'skill.specialization_id')
            .where('player_skill.player_id', playerID)
            .catch(reject);

            for (let i = 0; i < skills.length; i++)
            {
                const skill = skills[i];
                let skillName = skill.name;
                let specializationName = skill.specialization_name;

                if (specializationName)
                    skills[i].name = `${specializationName} (${skillName})`;
            }
            skills.sort((a,b) => a.name.localeCompare(b.name));
            resolve(skills);
        }),

        //Available Skills: 8
        con.select('skill_id', 'name')
        .from('skill')
        .whereNotIn('skill_id', con.select('skill_id').from('player_skill').where('player_id', playerID))
        .orderBy('name'),

        //Items: 9
        con.select('item.item_id', 'item.name', 'player_item.description')
        .from('item')
        .join('player_item', 'item.item_id', 'player_item.item_id')
        .where('player_item.player_id', playerID),

        //Available Items: 10
        con.select('item_id', 'name')
        .from('item')
        .whereNotIn('item_id', con.select('item_id').from('player_item').where('player_id', playerID))
        .orderBy('name'),

        //Finance: 11
        con.select('finance.*', 'player_finance.value')
        .from('finance')
        .join('player_finance', 'finance.finance_id', 'player_finance.finance_id')
        .where('player_finance.player_id', playerID),

        //Specializations: 12
        con.select('specialization_id', 'name').from('specialization'),

        //Combat Specializations: 13
        con.select('skill.name', 'skill.skill_id')
        .from('skill')
        .join('specialization', 'skill.specialization_id', 'specialization.specialization_id')
        .where('specialization.name', 'Lutar')
        .orWhere('specialization.name', 'Armas de Fogo'),
    ];

    try
    {
        const results = await Promise.all(queries);
        res.render('sheet1',
        {
            info: results[0],
            avatars: results[1],
            attributes: results[2],
            specs: results[3],
            characteristics: results[4],
            equipments: results[5],
            availableEquipments: results[6],
            skills: results[7],
            availableSkills: results[8],
            items: results[9],
            availableItems: results[10],
            finances: results[11],
            specializations: results[12],
            combatSpecializations: results[13],
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/2', async (req, res) =>
{
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).render('rejected', {message: 'ID de jogador não foi detectado. Você esqueceu de logar?'});
        
    try
    {
        const extraInfo = await con.select('extra_info.*', 'player_extra_info.value')
        .from('extra_info')
        .join('player_extra_info', 'extra_info.extra_info_id', 'player_extra_info.extra_info_id')
        .where('player_extra_info.player_id', playerID);
        
        res.render('sheet2', {playerID, extraInfo});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/admin', async (req, res) =>
{
    let adminID = req.session.playerID;

    if (!adminID)
        return res.status(401).render('rejected', {message: 'ID de jogador não foi detectado. Você esqueceu de logar?'});

    let admin = (await con.select('admin').from('player').where('player_id', adminID).first()).admin;

    if (!admin)
        return res.status(401).render('rejected', {message: 'ID de jogador não tem a permissão para acessar essa página.'});

    const charInfo = await con.select('player_id', 'login').from('player').where('admin', false);
    const characters = [];

    //All characters' names.
    const infoID = 1;

    let playerID = 0;

    const queries =
    [
        //Info: 0
        new Promise(async (resolve, reject) =>
        {
            const info = await con.select('value')
            .from('player_info')
            .where('player_id', playerID)
            .andWhere('info_id', infoID)
            .first()
            .catch(reject);
            let name = info.value;
            if(!name || name.length === 0)
                name = 'Desconhecido';
            resolve(name);
        }),

        //Attributes: 1
        con.select('attribute.*', 'player_attribute.value', 'player_attribute.max_value')
        .from('attribute')
        .join('player_attribute', 'attribute.attribute_id', 'player_attribute.attribute_id')
        .where('player_attribute.player_id', playerID),

        //Items: 2
        con.select('item.item_id', 'item.name')
        .from('item')
        .join('player_item', 'item.item_id', 'player_item.item_id')
        .where('player_item.player_id', playerID),

        //Characteristics: 3
        con.select('characteristic_id', 'value')
        .from('player_characteristic')
        .where('player_id', playerID)
        .andWhere('characteristic_id', 9)
        .first(),
    ];

    for (let i = 0; i < charInfo.length; i++)
    {
        playerID = charInfo[i].player_id;

        try
        {
            const results = await Promise.all(queries);
            const mov = results[3].value;
            const character =
            {
                playerID: playerID,
                //avatar: avatar,
                name: results[0],
                infoID: infoID,
                attributes: results[1],
                items: results[2],
                mov: mov,
                characteristics: results[3]
            };

            characters.push(character);
        }
        catch(err)
        {
            console.log(err);
            return res.status(500).send('Internal Server Error');
        }
    }
    
    res.render('sheetadmin', {characters: characters});
});

//#endregion

//#region CRUDs
router.post('/player/info', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let infoID = req.body.infoID;
    let value = req.body.value;

    try
    {
        await con('player_info')
        .update('value', value)
        .where('player_id', playerID)
        .andWhere('info_id', infoID);

        io.emit('info changed', {playerID, infoID, value});
        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/attribute', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let attrID = req.body.attributeID;
    let value = req.body.value;
    let maxValue = req.body.maxValue;

    try
    {
        await con('player_attribute')
        .update({'value': value, 'max_value': maxValue})
        .where('player_id', playerID)
        .andWhere('attribute_id', attrID);

        io.emit('attribute changed', {playerID, attributeID: attrID, value, maxValue});
        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/attributestatus', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let attrStatusID = req.body.attributeStatusID;
    let checked = req.body.checked === 'true' ? true : false;

    try
    {
        await con('player_attribute_status')
        .update('value', checked)
        .where('player_id', playerID)
        .andWhere('attribute_status_id', attrStatusID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/spec', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let specID = req.body.specID;
    let value = req.body.value;

    try
    {
        await con('player_spec')
        .update('value', value)
        .where('player_id', playerID)
        .andWhere('spec_id', specID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/characteristic', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let charID = req.body.characteristicID;
    let value = req.body.value;
    try
    {
        await con('player_characteristic')
        .update('value', value)
        .where('player_id', playerID)
        .andWhere('characteristic_id', charID);

        io.emit('char changed', {playerID, charID, value});
        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/player/equipment', urlParser, async (req, res) =>
{
    const playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    const equipmentID = req.body.equipmentID;
    
    try
    {
        await con.insert(
        {
            'player_id': playerID, 
            'equipment_id': equipmentID, 
            'current_ammo': '-', 
            'using': false
        }).into('player_equipment');
        
        const equip = await con.select('equipment.*', 'skill.name as skill_name', 'player_equipment.using', 'player_equipment.current_ammo')
        .from('equipment')
        .join('skill', 'equipment.skill_id', 'skill.skill_id')
        .join('player_equipment', 'equipment.equipment_id', 'player_equipment.equipment_id')
        .where('player_equipment.player_id', playerID)
        .andWhere('equipment.equipment_id', equipmentID)
        .first();

        const html = handlebars.partials.equipments(equip);
        res.send({html});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/equipment', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let equipmentID = req.body.equipmentID;
    let using = req.body.using === 'true' ? true : false;
    let currentAmmo = req.body.currentAmmo;

    try
    {
        await con('player_equipment')
        .update({'using': using, 'current_ammo': currentAmmo})
        .where('player_id', playerID)
        .andWhere('equipment_id', equipmentID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/player/equipment', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let equipmentID = req.body.equipmentID;

    try
    {
        await con('player_equipment')
        .where('player_id', playerID)
        .andWhere('equipment_id', equipmentID)
        .del();
        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/equipment', urlParser, async (req, res) =>
{
    let name = req.body.name;
    let skillID = req.body.skillID;
    let dmg = req.body.damage;
    let range = req.body.range;
    let atk = req.body.attacks;
    let ammo = req.body.ammo;
    let malf = req.body.malf;

    try
    {
        let equip = await con.insert(
        {
            'name': name,
            'skill_id': skillID,
            'damage': dmg,
            'range': range,
            'attacks': atk,
            'ammo': ammo,
            'malfunc': malf
        }).into('equipment');
        let equipmentID = equip[0];

        res.send({equipmentID});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/player/skill', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let skillID = req.body.skillID;

    try
    {
        await con.insert({'player_id': playerID, 'skill_id': skillID, 'value': 0, 'checked': false})
        .into('player_skill');

        const skill = await con.select('skill.skill_id', 'skill.name', 'specialization.name as specialization_name', 'player_skill.value', 'player_skill.checked')
        .from('skill')
        .join('player_skill', 'skill.skill_id', 'player_skill.skill_id')
        .leftJoin('specialization', 'skill.specialization_id', 'specialization.specialization_id')
        .where('player_skill.player_id', playerID)
        .andWhere('player_skill.skill_id', skillID)
        .first();

        if (skill.specialization_name)
        {
            let skillName = skill.name;
            skill.name = `${skill.specialization_name} (${skillName})`;
        }

        const html = handlebars.partials.skills(skill);

        res.send({html});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/skill', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let skillID = req.body.skillID;
    let value = req.body.value;
    let checked = req.body.checked === 'true' ? true : false;

    try
    {
        await con('player_skill')
        .update({'value': value, 'checked': checked})
        .where('player_id', playerID)
        .andWhere('skill_id', skillID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/skill', urlParser, async (req, res)  =>
{
    let specID = req.body.specializationID;
    if (specID === '')
        specID = null;
    let name = req.body.name;

    try
    {
        let skill = await con.insert(
        {
            'specialization_id': specID, 
            'name': name, 
            'mandatory': false, 
            'start_value': 0
        })
        .into('skill');
        let skillID = skill[0];

        res.send({skillID});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/finance', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let financeID = req.body.financeID;
    let value = req.body.value;

    try
    {
        await con('player_finance')
        .update('value', value)
        .where('player_id', playerID)
        .andWhere('finance_id', financeID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/player/item', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let itemID = req.body.itemID;

    try
    {
        await con.insert(
        {
            'player_id': playerID, 
            'item_id': itemID, 
            'description': con.select('description').from('item').where('item_id', itemID)
        })
        .into('player_item');

        const item = await con.select('item.item_id', 'item.name', 'player_item.description')
        .from('item')
        .join('player_item', 'item.item_id', 'player_item.item_id')
        .where('player_item.player_id', playerID)
        .andWhere('item.item_id', itemID)
        .first();

        const html = handlebars.partials.items(item);

        res.send({html});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }

    try
    {
        const query = await con.select('name').from('item').where('item_id', itemID).first();
        let name = query.name;
        io.emit('new item', {playerID, itemID, name});
    }
    catch (err)
    {
        console.log('Could not call new item event.');
        console.log(err);
    }
});

router.post('/player/item', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let itemID = req.body.itemID;
    let description = req.body.description;

    try
    {
        await con('player_item')
        .update('description', description)
        .where('player_id', playerID)
        .andWhere('item_id', itemID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.delete('/player/item', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let itemID = req.body.itemID;

    try
    {
        await con('player_item')
        .where('player_id', playerID)
        .andWhere('item_id', itemID)
        .del();
        
        io.emit('delete item', {playerID, itemID});
        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.put('/item', urlParser, async (req, res) =>
{
    let name = req.body.name;
    let desc = req.body.description;

    try
    {
        const query = await con.insert({'name': name, 'description': desc}).into('item');
        
        res.send({itemID: query[0]});
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/player/extrainfo', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;

    if(!playerID)
        return res.status(401).send('ID de jogador não encontrado. Você se esqueceu de logar?');

    let extraInfoID = req.body.extraInfoID;
    let value = req.body.value;

    try
    {
        await con('player_extra_info')
        .update('value', value)
        .where('player_id', playerID)
        .andWhere('extra_info_id', extraInfoID);

        res.send('OK');
    }
    catch (err)
    {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});
//#endregion

module.exports = router;