const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const con = require('../utils/connection');
var urlParser = bodyParser.urlencoded({extended: false});

router.get('/1', async(req, res) =>
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
        con.select('item_id, name')
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

module.exports = router;