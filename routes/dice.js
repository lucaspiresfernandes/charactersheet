const express = require('express');
const router = express.Router();
const RandomOrg = require('random-org');
const apiKey = process.env.RANDOM_ORG_KEY;
const random = new RandomOrg({ apiKey: apiKey });
const io = require('../server').io;

async function nextInt(min, max, n) {
    try {
        return (await random.generateIntegers({ min, max, n })).random;
    }
    catch (err) { console.log('Random.org inactive. Reason: ' + err); }

    let data = [];

    min = Math.ceil(min);
    max = Math.floor(max);
    
    for (let i = 0; i < n; i++)
        data.push(Math.floor(Math.random() * (max - min + 1) + min));

    return { data };
}

router.get('/single', async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).end();

    let max = req.query.max;

    if (max <= 1)
        return res.send({ num: 1 });

    let num = (await nextInt(1, max, 1)).data[0];
    res.send({ num });
    io.emit('dice roll', { playerID, max, num, type: 'single' });
});

router.get('/multiple', async (req, res) => {
    let playerID = req.session.playerID;
    let isAdmin = req.session.isAdmin;

    if (!playerID)
        return res.status(401).end();

    let dices = req.query.dices;

    let results = new Array(dices.length);

    let sum = 0;

    const tasks = [];

    for (let i = 0; i < dices.length; i++) {
        const dice = dices[i];
        const n = parseInt(dice.n);
        const num = parseInt(dice.num);

        if (isNaN(num) || isNaN(n))
            return res.status(400).end();

        if (n === 0 || num <= 1) {
            results[i] = num;
            sum += num;
            continue;
        }

        tasks.push(new Promise(async (resolve, reject) => {
            const data = (await nextInt(n, n * num, 1).catch(reject)).data;

            let tempSum = 0;
            data.forEach(el => {
                tempSum += el;
                sum += el;
            });

            results[i] = tempSum;

            resolve();
        }));
    }

    await Promise.all(tasks);

    res.send({ results, sum });

    if (isAdmin) return;

    io.emit('dice roll', { playerID, dices, results, sum, type: 'multiple' });
});

module.exports = router;