const express = require('express');
const router = express.Router();
const RandomOrg = require('random-org');
const apiKey = process.env.RANDOM_ORG_KEY;
const random = new RandomOrg({apiKey: apiKey});

async function nextInt(min, max, n)
{
    try
    {
        return (await random.generateIntegers({ min: min, max: max, n: n})).random;
    }
    catch (err) { console.log('Random.org inactive. Reason: ' + err); }
    
    let data = [];

    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = 0; i < n; i++)
    {
        let generated = Math.floor(Math.random() * (max - min + 1) + min);
        data.push(generated);
    }

    return {data};
}

router.get('/single', async (req, res) =>
{
    let max = req.query.max;

    if (max <= 1)
    {
        res.send({num:1});
        return;
    }

    let n = await nextInt(1, max, 1);
    res.send({num:n.data[0]});
});

router.get('/multiple', (req, res) =>
{
    let dices = req.query.dices;

    let results = new Array(dices.length);
    let finishedLength = 0;

    let totalSum = 0;
    
    for (let i = 0; i < dices.length; i++)
    {
        const dice = dices[i];
        let n = parseInt(dice.n);
        let num = parseInt(dice.num);

        if (isNaN(num) || isNaN(n))
            return res.status(400).send('Bad Request');

        if (n === 0 || num <= 1)
        {
            results[i] = num;
            totalSum += num;
            finishedLength++;

            if (finishedLength === dices.length)
                return res.send({results: results, sum: totalSum});
            
            continue;
        }

        nextInt(1, num, n).then(result =>
        {
            let data = result.data;
    
            let tempSum = 0;
            data.forEach(el =>
            {
                tempSum += el;
                totalSum += el;
            });

            results[i] = tempSum;
            finishedLength++;

            if (finishedLength === dices.length)
                res.send({results: results, sum: totalSum});
        });
    }
});

module.exports = router;