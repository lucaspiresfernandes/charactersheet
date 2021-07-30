const express = require('express');
const router = express.Router();
const jsonParser = require('body-parser').json();
const con = require('../utils/connection');

router.get('/', async (req, res) => {
    const playerID = req.session.playerID;

    const avatars = await con.select('avatar_id', '.link')
        .from('player_avatar')
        .where('player_avatar.player_id', playerID);

    res.send({ avatars });
});

router.post('/', jsonParser, async (req, res) => {
    const playerID = req.session.playerID;
    const data = req.body;

    if (!playerID)
        return res.status(401).render('rejected', { message: 'ID de jogador não foi detectado. Você esqueceu de logar?' });

    const avatars = await con.select('avatar_id').from('player_avatar').where('player_id', playerID);

    let queries = [];

    for (let i = 0; i < avatars.length; i++) {
        const id = avatars[i].avatar_id;

        const obj = data.find(av => av.avatar_id === id);

        if (!obj)
            return res.status(400).end();

        const avatarID = obj.avatar_id;
        const link = obj.link || null;
        if (link === '')
            link = null;

        const query = con('player_avatar')
            .update({ 'link': link })
            .where('avatar_id', avatarID)
            .andWhere('player_id', playerID);

        queries.push(query);
    }

    try {
        await Promise.all(queries);
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

module.exports = router;