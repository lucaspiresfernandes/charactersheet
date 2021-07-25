const express = require('express');
const router = express.Router();
const RandomOrg = require('random-org');
const apiKey = process.env.RANDOM_ORG_KEY;
const random = new RandomOrg({ apiKey: apiKey });
const io = require('../server').io;

async function nextInt(min, max, n) {
    try {
        return (await random.generateIntegers({ min: min, max: max, n: n })).random;
    }
    catch (err) { console.log('Random.org inactive. Reason: ' + err); }

    let data = [];

    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = 0; i < n; i++) {
        let generated = Math.floor(Math.random() * (max - min + 1) + min);
        data.push(generated);
    }

    return { data };
}

router.get('/single', async (req, res) => {
    let playerID = req.session.playerID;

    if (!playerID)
        return res.status(401).send('ID não encontrado. Você se esqueceu de logar?');

    let max = req.query.max;

    if (max <= 1) {
        res.send({ num: 1 });
        return;
    }

    let num = (await nextInt(1, max, 1)).data[0];
    res.send({ num });
    io.emit('dice roll', { playerID, max, num, type: 'single' });
});

//TODO: Optimize Random.org calls.
router.get('/multiple', (req, res) => {
    let playerID = req.session.playerID;
    let isAdmin = req.session.isAdmin;

    if (!playerID)
        return res.status(401).send('ID não encontrado. Você se esqueceu de logar?');

    let rawDices = req.query.dices;

    let dices = [];

    for (let i = 0; i < rawDices.length; i++)
    {
        const dice = rawDices[i];
        const n = parseInt(dice.n);
        const num = parseInt(dice.num);

        if (n === 0)
            dices.push({ n, num });

        for (let j = 0; j < n; j++)
            dices.push({ n: 1, num });
    }

    let results = new Array(dices.length);
    let finishedLength = 0;

    let sum = 0;

    for (let i = 0; i < dices.length; i++) {
        const dice = dices[i];
        const n = dice.n;
        const num = dice.num;

        if (isNaN(num) || isNaN(n))
            return res.status(400).send('Bad Request');

        if (n === 0 || num <= 1) {
            results[i] = num;
            sum += num;
            finishedLength++;

            if (finishedLength === dices.length) {
                if (!isAdmin)
                    io.emit('dice roll', { playerID, dices: rawDices, results, sum, type: 'multiple' });
                return res.send({ results, sum });
            }

            continue;
        }

        nextInt(1, num, n).then(result => {
            let data = result.data;

            let tempSum = 0;
            data.forEach(el => {
                tempSum += el;
                sum += el;
            });

            results[i] = tempSum;
            finishedLength++;

            if (finishedLength === dices.length) {
                if (!isAdmin)
                    io.emit('dice roll', { playerID, dices: rawDices, results, sum, type: 'multiple' });
                res.send({ results, sum });
            }
        });
    }
});

module.exports = router;