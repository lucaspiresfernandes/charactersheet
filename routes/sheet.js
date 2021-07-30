const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const con = require('../utils/connection');
const io = require('../server').io;
var urlParser = bodyParser.urlencoded({ extended: false });

const handlebars = require('hbs').handlebars;

//#region routes

router.get('/1', async (req, res) => {
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
            new Promise(async (resolve, reject) => {
                const results = await Promise.all([
                    //Attributes
                    con.select('attribute.*', 'player_attribute.value', 'player_attribute.max_value')
                        .from('attribute')
                        .join('player_attribute', 'attribute.attribute_id', 'player_attribute.attribute_id')
                        .where('player_attribute.player_id', playerID),

                    //Status
                    con.select('attribute_status.*', 'player_attribute_status.value')
                        .from('attribute_status')
                        .join('player_attribute_status', 'attribute_status.attribute_status_id', 'player_attribute_status.attribute_status_id')
                        .where('player_attribute_status.player_id', playerID)
                ]).catch(reject);

                const attributes = results[0];
                const status = results[1];

                for (let i = 0; i < attributes.length; i++) {
                    const attr = attributes[i];
                    attr.status = [];

                    let cur = attr.value;
                    let max = attr.max_value;
                    if (cur === 0)
                        attr.coeficient = 0;
                    else
                        attr.coeficient = (cur / max) * 100;

                    for (let j = 0; j < status.length; j++) {
                        const stat = status[j];
                        stat.checked = stat.value ? true : false;
                        if (stat.attribute_id === attr.attribute_id)
                            attr.status.push(stat);
                    }
                }

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
            new Promise(async (resolve, reject) => {
                const skills = await con.select('skill.skill_id', 'skill.name', 'player_skill.value', 'player_skill.checked', 'specialization.name as specialization_name')
                    .from('skill')
                    .join('player_skill', 'skill.skill_id', 'player_skill.skill_id')
                    .leftJoin('specialization', 'specialization.specialization_id', 'skill.specialization_id')
                    .where('player_skill.player_id', playerID)
                    .catch(reject);

                for (let i = 0; i < skills.length; i++) {
                    const skill = skills[i];
                    let skillName = skill.name;
                    let specializationName = skill.specialization_name;

                    if (specializationName)
                        skills[i].name = `${specializationName} (${skillName})`;
                }
                skills.sort((a, b) => a.name.localeCompare(b.name));
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
            con.select().from('specialization'),

            //Combat Specializations: 13
            con.select('skill.name', 'skill.skill_id')
                .from('skill')
                .join('specialization', 'skill.specialization_id', 'specialization.specialization_id')
                .where('specialization.name', 'Lutar')
                .orWhere('specialization.name', 'Armas de Fogo'),
        ];

    try {
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
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get('/2', async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID de jogador não foi detectado. Você esqueceu de logar?' });

    try {
        const extraInfo = await con.select('extra_info.*', 'player_extra_info.value')
            .from('extra_info')
            .join('player_extra_info', 'extra_info.extra_info_id', 'player_extra_info.extra_info_id')
            .where('player_extra_info.player_id', playerID);

        res.render('sheet2', { playerID, extraInfo });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.get('/admin/1', async (req, res) => {
    let playerID = req.session.playerID;
    let isAdmin = req.session.isAdmin;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID não foi detectado. Você esqueceu de logar?' });

    if (!isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    const charIDs = await con.select('player_id').from('player').where('admin', false);
    const characters = [];

    const adminQueries =
        [
            //Admin Notes: 0
            con.select('admin_id', 'value')
                .from('admin_note')
                .where('admin_id', playerID)
                .first(),
        ]

    try {
        for (let i = 0; i < charIDs.length; i++) {
            let playerID = charIDs[i].player_id;

            const playerQueries =
                [
                    //Avatar: 0
                    con.select('link')
                        .from('player_avatar')
                        .where('player_id', playerID)
                        .andWhere('avatar_id', 1)
                        .first(),

                    //Info: 1
                    new Promise(async (resolve, reject) => {
                        const info = await con.select('info.info_id', 'player_info.value')
                            .from('info')
                            .join('player_info', 'info.info_id', 'player_info.info_id')
                            .where('player_id', playerID)
                            .andWhere('info.name', 'Nome')
                            .first()
                            .catch(reject);

                        if (!info.value || info.value.length === 0)
                            info.value = 'Desconhecido';
                        resolve(info);
                    }),

                    //Attributes: 2
                    con.select('attribute.attribute_id', 'attribute.name', 'attribute.fill_color',
                        'player_attribute.value', 'player_attribute.max_value')
                        .from('attribute')
                        .join('player_attribute', 'attribute.attribute_id', 'player_attribute.attribute_id')
                        .where('player_attribute.player_id', playerID),

                    //Specs: 3
                    con.select('spec.*', 'player_spec.value')
                        .from('spec')
                        .join('player_spec', 'spec.spec_id', 'player_spec.spec_id')
                        .where('player_spec.player_id', playerID),

                    //Characteristics: 4
                    con.select('characteristic.characteristic_id', 'characteristic.name', 'player_characteristic.value')
                        .from('characteristic')
                        .join('player_characteristic', 'characteristic.characteristic_id', 'player_characteristic.characteristic_id')
                        .where('player_characteristic.player_id', playerID)
                        .andWhere('characteristic.name', 'Movimento'),

                    //Combat: 5
                    con.select('equipment.equipment_id', 'player_equipment.using', 'equipment.name', 'equipment.damage', 'equipment.range', 'equipment.attacks')
                        .from('equipment')
                        .join('player_equipment', 'equipment.equipment_id', 'player_equipment.equipment_id')
                        .where('player_equipment.player_id', playerID),

                    //Items: 6
                    con.select('item.item_id', 'item.name', 'player_item.description')
                        .from('item')
                        .join('player_item', 'item.item_id', 'player_item.item_id')
                        .where('player_item.player_id', playerID),

                    //Finances: 7
                    con.select('finance.*', 'player_finance.value')
                        .from('finance')
                        .join('player_finance', 'finance.finance_id', 'player_finance.finance_id')
                        .where('player_finance.player_id', playerID)
                ];

            const results = await Promise.all(playerQueries);
            const char =
            {
                playerID: playerID,
                avatar: results[0],
                name: results[1],
                attributes: results[2],
                specs: results[3],
                characteristics: results[4],
                equipments: results[5],
                items: results[6],
                finances: results[7],
            };

            characters.push(char);
        }

        const results = await Promise.all(adminQueries);

        res.render('sheetadmin1', { adminID: playerID, characters, adminNotes: results[0] });
    }
    catch (err) {
        console.log(err);
        return res.status(500).end();
    }
});

router.get('/admin/2', async (req, res) => {
    let playerID = req.session.playerID;
    let isAdmin = req.session.isAdmin;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID não foi detectado. Você esqueceu de logar?' });

    if (!isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    const queries = [
        //All Equipments: 0
        con.select('equipment.*', 'skill.name as skill_name')
            .from('equipment')
            .join('skill', 'equipment.skill_id', 'skill.skill_id'),

        //All Skills: 1
        con.select('skill.*', 'specialization.name as specialization_name')
            .from('skill')
            .leftJoin('specialization', 'skill.specialization_id', 'specialization.specialization_id')
            .orderBy('skill.name'),

        //All Items: 2
        con.select('item.*').from('item'),

        //Specializations: 3
        con.select().from('specialization'),

        //Combat Specializations: 4
        con.select('skill.name', 'skill.skill_id')
            .from('skill')
            .join('specialization', 'skill.specialization_id', 'specialization.specialization_id')
            .where('specialization.name', 'Lutar')
            .orWhere('specialization.name', 'Armas de Fogo'),
    ];

    try {
        const results = await Promise.all(queries);

        res.render('sheetadmin2',
            {
                equipmentsList: results[0],
                skillsList: results[1],
                itemsList: results[2],
                specializations: results[3],
                combatSpecializations: results[4],
            });
    }
    catch (err) {
        console.log(err);
        return res.status(500).end();
    }
})

//#endregion

//#region CRUDs
router.post('/player/info', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let infoID = req.body.infoID;
    let value = req.body.value;

    try {
        await con('player_info')
            .update('value', value)
            .where('player_id', playerID)
            .andWhere('info_id', infoID);

        io.emit('info changed', { playerID, infoID, value });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/attribute', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let attrID = req.body.attributeID;
    let value = req.body.value;
    let maxValue = req.body.maxValue;

    try {
        await con('player_attribute')
            .update({ 'value': value, 'max_value': maxValue })
            .where('player_id', playerID)
            .andWhere('attribute_id', attrID);

        io.emit('attribute changed', { playerID, attributeID: attrID, value, maxValue });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/attributestatus', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let attrStatusID = req.body.attributeStatusID;
    let checked = req.body.checked === 'true' ? true : false;

    try {
        await con('player_attribute_status')
            .update('value', checked)
            .where('player_id', playerID)
            .andWhere('attribute_status_id', attrStatusID);

        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/spec', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let specID = req.body.specID;
    let value = req.body.value;

    try {
        await con('player_spec')
            .update('value', value)
            .where('player_id', playerID)
            .andWhere('spec_id', specID);

        io.emit('spec changed', { playerID, specID, value });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/characteristic', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let charID = req.body.characteristicID;
    let value = req.body.value;
    try {
        await con('player_characteristic')
            .update('value', value)
            .where('player_id', playerID)
            .andWhere('characteristic_id', charID);

        io.emit('characteristic changed', { playerID, charID, value });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/player/equipment', urlParser, async (req, res) => {
    const playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    const equipmentID = req.body.equipmentID;

    try {
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
        res.send({ html });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }

    try {
        const equip = await con.select('name', 'damage', 'range', 'attacks')
            .from('equipment')
            .where('equipment_id', equipmentID)
            .first();

        io.emit('equipment changed', {
            playerID, equipmentID, using: false, name: equip.name,
            damage: equip.damage, range: equip.range, attacks: equip.attacks, type: 'create'
        });
    }
    catch (err) {
        console.log('Could not call equipment changed event.');
        console.log(err);
    }
});

router.post('/player/equipment', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let equipmentID = req.body.equipmentID;
    let using = req.body.using === 'true' ? true : false;
    let currentAmmo = req.body.currentAmmo;

    try {
        await con('player_equipment')
            .update({ 'using': using, 'current_ammo': currentAmmo })
            .where('player_id', playerID)
            .andWhere('equipment_id', equipmentID);
        io.emit('equipment changed', { playerID, equipmentID, using, type: 'update' });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/player/equipment', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let equipmentID = req.body.equipmentID;

    try {
        await con('player_equipment')
            .where('player_id', playerID)
            .andWhere('equipment_id', equipmentID)
            .del();
        io.emit('equipment changed', { playerID, equipmentID, type: 'delete' });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/equipment', urlParser, async (req, res) => {
    let name = req.body.name;
    let skillID = req.body.skillID;
    let dmg = req.body.damage;
    let range = req.body.range;
    let atk = req.body.attacks;
    let ammo = req.body.ammo;
    let malf = req.body.malf;

    try {
        const equipmentID = (await con.insert(
            {
                'name': name,
                'skill_id': skillID,
                'damage': dmg,
                'range': range,
                'attacks': atk,
                'ammo': ammo,
                'malfunc': malf
            }).into('equipment'))[0];

        res.send({ equipmentID });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/equipment', urlParser, async (req, res) => {

    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let equipmentID = req.body.equipmentID;
    let name = req.body.name;
    let skillID = req.body.skillID;
    let dmg = req.body.damage;
    let range = req.body.range;
    let atk = req.body.attacks;
    let ammo = req.body.ammo;
    let malf = req.body.malf;

    try {
        await con('equipment')
            .update(
                {
                    'name': name,
                    'skill_id': skillID,
                    'damage': dmg,
                    'range': range,
                    'attacks': atk,
                    'ammo': ammo,
                    'malfunc': malf,
                })
            .where('equipment_id', equipmentID);
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/equipment', urlParser, async (req, res) => {
    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let equipmentID = req.body.equipmentID;

    try {
        await con('equipment')
            .where('equipment_id', equipmentID)
            .del();
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/player/skill', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let skillID = req.body.skillID;

    try {
        const subquery = con.select('start_value').from('skill').where('skill_id', skillID);
        await con.insert({ 'player_id': playerID, 'skill_id': skillID, 'value': subquery, 'checked': false })
            .into('player_skill');

        const skill = await con.select('skill.skill_id', 'skill.name', 'specialization.name as specialization_name', 'player_skill.value', 'player_skill.checked')
            .from('skill')
            .join('player_skill', 'skill.skill_id', 'player_skill.skill_id')
            .leftJoin('specialization', 'skill.specialization_id', 'specialization.specialization_id')
            .where('player_skill.player_id', playerID)
            .andWhere('player_skill.skill_id', skillID)
            .first();

        if (skill.specialization_name) {
            let skillName = skill.name;
            skill.name = `${skill.specialization_name} (${skillName})`;
        }

        const html = handlebars.partials.skills(skill);

        res.send({ html });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/skill', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let skillID = req.body.skillID;
    let value = req.body.value;
    let checked = req.body.checked === 'true' ? true : false;

    try {
        await con('player_skill')
            .update({ 'value': value, 'checked': checked })
            .where('player_id', playerID)
            .andWhere('skill_id', skillID);

        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/skill', urlParser, async (req, res) => {
    let specializationID = req.body.specializationID;
    if (specializationID === '0')
        specializationID = null;
    let name = req.body.name;

    try {
        let skill = await con.insert(
            {
                'specialization_id': specializationID,
                'name': name,
                'mandatory': false,
                'start_value': 0
            })
            .into('skill');
        let skillID = skill[0];

        res.send({ skillID });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/skill', urlParser, async (req, res) => {

    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let skillID = req.body.skillID;
    let specializationID = req.body.specializationID;
    if (specializationID === '0')
        specializationID = null;
    let name = req.body.name;
    let mandatory = req.body.mandatory === 'true';
    let startValue = req.body.startValue;

    try {
        await con('skill')
            .update(
                {
                    'specialization_id': specializationID,
                    'name': name,
                    'mandatory': mandatory,
                    'start_value': startValue,
                })
            .where('skill_id', skillID);
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/skill', urlParser, async (req, res) => {
    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let skillID = req.body.skillID;

    try {
        await con('skill')
            .where('skill_id', skillID)
            .del();
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/finance', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let financeID = req.body.financeID;
    let value = req.body.value;

    try {
        await con('player_finance')
            .update('value', value)
            .where('player_id', playerID)
            .andWhere('finance_id', financeID);

        io.emit('finance changed', {playerID, financeID, value});
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/player/item', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let itemID = req.body.itemID;

    try {
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

        res.send({ html });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }

    try {
        const query = await con.select('item.name', 'player_item.description')
            .from('item')
            .join('player_item', 'item.item_id', 'player_item.item_id')
            .where('item.item_id', itemID)
            .andWhere('player_item.player_id', playerID)
            .first();

        let name = query.name;
        let description = query.description;

        io.emit('item changed', { playerID, itemID, name, description, type: 'create' });
    }
    catch (err) {
        console.log('Could not call new item event.');
        console.log(err);
    }
});

router.post('/player/item', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let itemID = req.body.itemID;
    let description = req.body.description;

    try {
        await con('player_item')
            .update('description', description)
            .where('player_id', playerID)
            .andWhere('item_id', itemID);

        io.emit('item changed', { playerID, itemID, description, type: 'update' });

        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/player/item', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let itemID = req.body.itemID;

    try {
        await con('player_item')
            .where('player_id', playerID)
            .andWhere('item_id', itemID)
            .del();

        io.emit('item changed', { playerID, itemID, type: 'delete' });
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.put('/item', urlParser, async (req, res) => {
    let name = req.body.name;
    let desc = req.body.description;

    try {
        const query = await con.insert({ 'name': name, 'description': desc }).into('item');

        res.send({ itemID: query[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/item', urlParser, async (req, res) => {

    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let itemID = req.body.itemID;
    let name = req.body.name;
    let description = req.body.description;

    try {
        await con('item')
            .update(
                {
                    'name': name,
                    'description': description,
                })
            .where('item_id', itemID);
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.delete('/item', urlParser, async (req, res) => {
    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let itemID = req.body.itemID;

    try {
        await con('item')
            .where('item_id', itemID)
            .del();
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/player/extrainfo', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let extraInfoID = req.body.extraInfoID;
    let value = req.body.value;

    try {
        await con('player_extra_info')
            .update('value', value)
            .where('player_id', playerID)
            .andWhere('extra_info_id', extraInfoID);

        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

router.post('/admin/note', urlParser, async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();
    if (!req.session.isAdmin)
        return res.status(401).render('rejected', { message: 'Não é um administrador.' });

    let value = req.body.value;

    try {
        await con('admin_note')
            .update('value', value)
            .where('admin_id', playerID);
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
})
//#endregion

module.exports = router;