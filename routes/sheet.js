const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const con = require('../utils/connection');
var urlParser = bodyParser.urlencoded({extended: false});

router.get('/1', async (req, res) =>
{
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID de jogador não foi detectado. Você esqueceu de logar?' });

    const availableEquipmentsSubQuery = con.select('equipment_id').from('player_equipment').where('player_id', playerID);
    const availableSkillsSubQuery = con.select('skill_id').from('player_skill').where('player_id', playerID);
    const availableItemsSubQuery = con.select('item_id').from('player_item').where('player_id', playerID);

    const queries =
    [
        //Info: 0
        con.select('info.*', 'player_info.value')
            .from('info')
            .join('player_info', 'info.info_id', 'player_info.info_id')
            .where('player_info.player_id', playerID),

        //Attributes: 1
        new Promise(async (resolve, reject) =>
        {
            const attributes = await con.select('attribute.*', 'player_attribute.value', 'player_attribute.max_value')
                .from('attribute')
                .join('player_attribute', 'attribute.attribute_id', 'player_attribute.attribute_id')
                .where('player_attribute.player_id', playerID).catch(reject);
            
            const status = await con.select('attribute_status.*', 'player_attribute_status.value')
                .from('attribute_status')
                .join('player_attribute_status', 'attribute_status.attribute_status_id', 'player_attribute_status.attribute_status_id')
                .where('player_attribute_status.player_id', playerID).catch(reject);
            
            for (let i = 0; i < attributes.length; i++)
            {
                const attr = attributes[i];
                attr.status = [];
                let cur = attr.value;
                let max = attr.max_value;
                if (cur === 0)
                    attr.coeficient = 0;
                else
                    attr.coeficient = Math.min((cur / max) * 100, 100);

                for (let i = 0; i < status.length; i++)
                {
                    const stat = status[i];
                    if (stat.value)
                        stat.checked = 'checked';
                    if (stat.attribute_id === attr.attribute_id)
                        attr.status.push(stat);
                }
            }
            resolve(attributes);
        }),
            
        //Specs: 2
        con.select('spec.*', 'player_spec.value')
            .from('spec')
            .join('player_spec', 'spec.spec_id', 'player_spec.spec_id')
            .where('player_spec.player_id', playerID),
        
        //Characteristics: 3
        con.select('characteristic.*', 'player_characteristic.value')
            .from('characteristic')
            .join('player_characteristic', 'characteristic.characteristic_id', 'player_characteristic.characteristic_id')
            .where('player_characteristic.player_id', playerID),

        //Player Equipments: 4
        con.select('equipment.*', 'skill.name as skill_name, player_equipment.using', 'player_equipment.current_ammo')
            .from('equipment')
            .join('skill', 'equipment.skill_id', 'skill.skill_id')
            .join('player_equipment', 'equipment.equipment_id', 'player_equipment.equipment_id')
            .where('player_equipment.player_id', playerID),

        //Available Equipments: 5
        con.select('equipment_id', 'name')
            .from('equipment')
            .whereNotIn('equipment_id', availableEquipmentsSubQuery)
            .orderBy('name'),

        //Skills: 6
        new Promise(async (resolve, reject) =>
        {
            const specializedSkills = await con.select('skill.skill_id', 'specialization.name')
                .from('skill')
                .join('specialization', 'skill.specialization_id', 'specialization.specialization_id')
                .catch(reject);
            const skills = await con.select('skill.skill_id', 'skill.name', 'player_skill.value', 'player_skill.checked')
                .from('skill')
                .join('player_skill', 'skill.skill_id', 'player_skill.skill_id')
                .where('player_skill.player_id', playerID)
                .catch(reject);
            
            for (let i = 0; i < skills.length; i++)
            {
                const skill = skills[i];
                let id = skill.skill_id;
                let skillName = skill.name;
                for (let j = 0; j < specializedSkills.length; j++)
                {
                    const specSkill = specializedSkills[j];
                    if (specSkill.skill_id !== id)
                        continue;
                    skills[i].name = `${specSkill.name} (${skillName})`;
                }
            }
            skills.sort((a,b) => a.name.localeCompare(b.name));
            resolve(skills);
        }),

        //Available Skills: 7
        con.select('skill_id', 'name')
            .from('skill')
            .whereNotIn('skill_id', availableSkillsSubQuery)
            .orderBy('name'),

        //Items: 8
        con.select('item.item_id', 'item.name', 'player_item.description')
            .from('item')
            .join('player_item', 'item.item_id', 'player_item.item_id')
            .where('player_item.player_id', playerID),

        //Available Items: 9
        con.select('item_id', 'name')
            .from('item')
            .whereNotIn('item_id', availableItemsSubQuery)
            .orderBy('name'),

        //Finances: 10
        con.select('finances.*', 'player_finances.value')
            .from('finances')
            .join('player_finances', 'finances.finances_id', 'player_finances.finances_id')
            .where('player_finances.player_id', playerID),

        //Specializations: 11
        con.select('specialization_id', 'name').from('specialization'),

        //Combat Specializations: 12
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
            attributes: results[1],
            specs: results[2],
            characteristics: results[3],
            equipments: results[4],
            availableEquipments: results[5],
            skills: results[6],
            availableSkills: results[7],
            items: results[8],
            availableItems: results[9],
            finances: results[10],
            specializations: results[11],
            combatSpecializations: results[12],
        });
    }
    catch(err)
    {
        res.status(500).send({err});
    }
});

router.get('/2', async (req, res) =>
{
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).render('rejected', {message: 'ID de jogador não foi detectado. Você esqueceu de logar?'});
        
    try
    {
        const info = await con.select('extra_info.*', 'player_extra_info.value')
            .from('extra_info')
            .join('player_extra_info', 'extra_info.extra_info_id', 'player_extra_info.extra_info_id')
            .where('player_extra_info.player_id', playerID);
        
        res.render('sheet2', {playerID, info});
    }
    catch(err)
    {
        res.status(500).send({err});
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
        //let avatar = cloudinary.url(`${playerID}/def`, {secure: true});

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
            return res.status(500).send({err});
        }
    }
    
    res.render('sheetadmin', {characters: characters});
});

router.post('/player/info', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let infoID = req.body.infoID;
    let value = req.body.value;

    try
    {
        await con.update('player_info')
        .set('value', value)
        .where('player_id', playerID)
        .andWhere('info_id', infoID);

        io.emit('info changed', {playerID, infoID, value});
        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/attribute', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let attrID = req.body.attributeID;
    let value = req.body.value;
    let maxValue = req.body.maxValue;

    try
    {
        await con.update('player_attribute')
        .set({'value': value, 'max_value': maxValue})
        .where('player_id', playerID)
        .andWhere('attribute_id', attrID);

        io.emit('attribute changed', {playerID, attributeID: attrID, value, maxValue});
        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/attributestatus', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let attrStatusID = req.body.attributeStatusID;
    let checked = req.body.checked === 'true' ? true : false;

    try
    {
        await con.update('player_attribute_status')
        .set('value', checked)
        .where('player_id', playerID)
        .andWhere('attribute_status_id', attrStatusID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/spec', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let specID = req.body.specID;
    let value = req.body.value;

    try
    {
        await con.update('player_spec')
        .set('value', value)
        .where('player_id', playerID)
        .andWhere('spec_id', specID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/characteristic', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let charID = req.body.characteristicID;
    let value = req.body.value;

    try
    {
        await con.update('player_characteristic')
        .set('value', value)
        .where('player_id', playerID)
        .andWhere('characteristic_id', charID);

        io.emit('char changed', {playerID, charID, value});
        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.put('/player/equipment', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let equipmentID = req.body.equipmentID;

    try
    {
        await con.insert(
        {
            'playerID': playerID, 
            'equipmentID': equipmentID, 
            'current_ammo': '-', 
            'using': false
        }).into('player_equipment');

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/equipment', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let equipmentID = req.body.equipmentID;
    let using = req.body.using === 'true' ? true : false;
    let currentAmmo = req.body.currentAmmo;

    try
    {
        await con.update('player_equipment')
        .set({'using': using, 'current_ammo': currentAmmo})
        .where('player_id', playerID)
        .andWhere('equipment_id', equipmentID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.delete('/player/equipment', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
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
        res.status(500).send({err});
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
        res.status(500).send({err});
    }

    let sql = "INSERT INTO equipment (name, skill_id, damage, equipment.range, attacks, ammo, malfunc) VALUES (?, ?, ?, ?, ?, ?, ?)";
    let post = [name, skillID, dmg, range, atk, ammo, malf];

    let code = 200;
    let result;
    result = await db.promiseQuery(sql, post).catch(err => {code = 500, result = err; console.log(err);});
    res.status(code).send(result);
});

router.put('/player/skill', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let skillID = req.body.skillID;

    try
    {
        const subquery = con.select('start_value').from('skill').where('skill_id', skillID);
        await con.insert({'player_id': playerID, 'skill_id': skillID, 'value': 0, 'checked': subquery})
        .into('player_skill');

        res.send('OK')
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/skill', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let skillID = req.body.skillID;
    let value = req.body.value;
    let checked = req.body.checked === 'true' ? true : false;

    try
    {
        await con.update('player_skill')
        .set({'value': value, 'checked': checked})
        .where('player_id', playerID)
        .andWhere('skill_id', skillID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.put('/skill', urlParser, async (req, res)  =>
{
    let specID = req.body.specializationID;
    if (specID === '')
        specID = null;
    let skillName = req.body.skillName;

    try
    {
        let skill = await con.insert(
        {
            'specialization_id': specID, 
            'name': skillName, 
            'mandatory': false, 
            'start_value': 0
        })
        .into('skill');
        let skillID = skill[0];

        res.send({skillID});
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.post('/player/finance', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let financeID = req.body.financeID;
    let value = req.body.value;

    try
    {
        await con.update('player_finance')
        .set('value', value)
        .where('player_id', playerID)
        .andWhere('finance_id', financeID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.put('/player/item', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
    let itemID = req.body.itemID;

    try
    {
        const subquery = con.select('description').from('item').where('item_id', itemID);
        await con.insert(
        {
            'player_id': playerID, 
            'item_id': itemID, 
            'description': subquery
        })
        .into('player_item');

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }

    try
    {
        const query = await com.select('name').from('item').where('item_id', itemID).first();
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
    let itemID = req.body.itemID;
    let description = req.body.description;

    try
    {
        await con.update('player_item')
        .set('description', description)
        .where('player_id', playerID)
        .andWhere('item_id', itemID);

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

router.delete('/player/item', urlParser, async (req, res) =>
{
    let playerID = req.session.playerID;
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
        res.status(500).send({err});
    }
});

router.put('/item', urlParser, async (req, res) =>
{
    let name = req.body.name;
    let desc = req.body.description;

    try
    {
        await con.insert({'name': name, 'description': desc}).into('item');

        res.send('OK');
    }
    catch (err)
    {
        res.status(500).send({err});
    }
});

module.exports = router;