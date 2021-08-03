const diceResultContent = $('#diceResultContent');
diceResultContent.hide();
const diceResultDescription = $('#diceResultDescription');
diceResultDescription.hide();
const loading = $('.loading');

const generalDiceModal = new bootstrap.Modal($('#generalDiceRoll')[0]);
const diceRollModal = new bootstrap.Modal($('#diceRoll')[0]);

const generalDiceText = $('#generalDiceText');

const failureToast = new bootstrap.Toast($('#failureToast')[0], { delay: 4000 });
const failureToastBody = $('#failureToast > .toast-body');

//General
function showFailureToastMessage(err) {
    console.log(err);
    failureToastBody.text(`Erro ao tentar aplicar mudança - ${err.text}`);
    failureToast.show();
}

$('#generalDiceRoll').on('shown.bs.modal', ev => {
    generalDiceText[0].focus();
});

function generalDiceClick(event) {
    let dices = resolveDices(generalDiceText.val());
    rollDices(dices);
    generalDiceModal.hide();
    diceRollModal.show();
    generalDiceText.val('');
}

function rollDices(dices) {
    loading.show();
    function onSuccess(data) {
        let sum = data.sum;
        let results = data.results;

        loading.hide();
        diceResultContent.text(sum)
            .fadeIn('slow', () => {
                if (results.length <= 1)
                    return;

                diceResultDescription.text(results.join(' + '))
                    .fadeIn('slow');
            });
    }

    $.ajax('/dice/multiple',
        {
            data: { dices },
            success: onSuccess,
            error: showFailureToastMessage
        });
}

function resolveDices(str) {
    let dices = str.replace(/\s+/g, '').toLowerCase().split('+');
    let arr = [];
    for (let i = 0; i < dices.length; i++) {
        const dice = dices[i];
        resolveDice(dice, arr);
    }
    return arr;
}

function resolveDice(dice, arr) {
    let n = 0, num;

    let split = dice.split('d');

    if (split.length === 1)
        return arr.push({ n, num: dice });

    n = split[0];
    if (n === '')
        n = 1;
    num = split[1];
    for (let i = 0; i < n; i++) {
        arr.push({ n: '1', num });
    }
}

$('#diceRoll').on('hidden.bs.modal', ev => {
    diceResultContent.text('')
        .hide();
    diceResultDescription.text('')
        .hide();
});

const order = $('#order');
const orderAddText = $('#orderAddText');

function orderAddButtonClick(event) {
    const val = orderAddText.val();
    orderAddText.val('');

    if (!val || val.length === 0)
        return;

    const btn = $(document.createElement('button'));
    btn.attr('class', 'acds-element')
        .text('-');

    const txt = $(document.createElement('input'));
    txt.attr({ type: 'text', class: 'acds-element acds-bottom-text', maxLength: '3' })
        .css({ color: 'darkgray', maxWidth: '3rem', margin: '0px 5px 0px 5px' });

    const li = $(document.createElement('li'));
    li.attr('class', 'ui-state-default')
        .text(val)
        .append(txt, btn);

    btn.on('click', ev => li.remove());

    order.append(li);
}

function adminAnotationsChange(event) {
    const value = $(event.target).val();

    $.ajax('/sheet/admin/note',
        {
            method: 'POST',
            data: { value },
            error: showFailureToastMessage
        });
}

socket.on('info changed', content => {
    let playerID = content.playerID;
    let infoID = content.infoID;
    let value = content.value;

    playerNames.set(playerID, value);

    $(`#info${playerID}${infoID}`).text(value);
});

socket.on('attribute changed', content => {
    let playerID = content.playerID;
    let attrID = content.attributeID;
    let newValue = content.value;
    let newMaxValue = content.maxValue;

    let element = $(`#attribute${playerID}${attrID}`);
    const split = element.text().split('/');

    const value = split[0];
    const maxValue = split[1];

    let newText = '';

    if (newValue)
        newText += `${newValue}/`;
    else
        newText += `${value}/`;

    if (newMaxValue)
        newText += `${newMaxValue}`;
    else
        newText += `${maxValue}`;

    element.text(newText);
});

socket.on('spec changed', content => {
    let playerID = content.playerID;
    let specID = content.specID;
    let value = content.value;

    $(`#spec${playerID}${specID}`).text(value);
});

socket.on('characteristic changed', content => {
    let playerID = content.playerID;
    let charID = content.charID;
    let value = content.value;

    $(`#characteristic${playerID}${charID}`).text(value);
});

socket.on('finance changed', content => {
    let playerID = content.playerID;
    let financeID = content.financeID;
    let value = content.value;
    
    $(`#finance${playerID}${financeID}`).text(value);
})

socket.on('equipment changed', content => {
    let playerID = content.playerID;
    let equipmentID = content.equipmentID;
    let using = content.using;
    let name = content.name;
    let damage = content.damage;
    let range = content.range;
    let attacks = content.attacks;

    let type = content.type;

    switch (type) {
        case 'create':
            const newIcon = $(document.createElement('i'));
            newIcon.attr('class', using ? 'bi bi-check' : 'bi bi-x');

            const usingRow = $(document.createElement('td'));
            usingRow.attr('id', `equipmentUsing${playerID}${equipmentID}`)
                .append(newIcon);

            const nameRow = $(document.createElement('td'));
            nameRow.text(name);

            const damageRow = $(document.createElement('td'));
            damageRow.text(damage);

            const rangeRow = $(document.createElement('td'));
            rangeRow.text(range);

            const attacksRow = $(document.createElement('td'));
            attacksRow.text(attacks);

            const newRow = $(document.createElement('tr'))
                .attr('id', `equipmentRow${playerID}${equipmentID}`)
                .append(usingRow, nameRow, damageRow, rangeRow, attacksRow);

            $(`#equipmentTable${playerID}`).append(newRow);
            break;
        case 'delete':
            $(`#equipmentRow${playerID}${equipmentID}`).remove();
            break;
        case 'update':
            let icon = using ? 'bi bi-check' : 'bi bi-x';
            $(`#equipmentUsing${playerID}${equipmentID} > i`).attr('class', icon);
            break;
    }
});

socket.on('item changed', content => {
    let playerID = content.playerID;
    let itemID = content.itemID;
    let name = content.name;
    let description = content.description;

    let type = content.type;

    switch (type) {
        case 'create':
            const newData = $(document.createElement('td'));
            newData.attr({ 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'top', 'title': description })
                .text(name);

            const newRow = $(document.createElement('tr'));
            newRow.attr('id', `itemRow${playerID}${itemID}`)
                .append(newData);

            $(`#itemTable${playerID}`).append(newRow);
            break;
        case 'delete':
            $(`#itemRow${playerID}${itemID}`).remove();
            break;
        case 'update':
            $(`#itemRow${playerID}${itemID} > td`).attr('title', description);
            break;
    }
});

const diceList = $('#diceList');

socket.on('dice roll', content => {
    let id = content.playerID;
    let playerName = playerNames.get(id);
    if (!playerName)
        playerName = 'Desconhecido';

    let num = content.num;
    let max = content.max;

    let auxDices = content.dices;
    let dices = [];

    if (auxDices) {
        for (let i = 0; i < auxDices.length; i++) {
            const dice = auxDices[i];
            const n = dice.n;
            const num = dice.num;

            if (n > 0)
                dices.push(`${n}d${num}`);
            else
                dices.push(num);
        }
    }

    let results = content.results;

    let sum = content.sum;

    let type = content.type;

    const children = diceList.children();
    if (children.length > 10)
        children[children.length - 1].remove();

    const li = $(document.createElement('li'));

    switch (type) {
        case 'single':
            li.html(`<span style="color:red;">${playerName}</span> rolou <span style="color:green;">1d${max}</span> 
            e tirou <span style="color:green;">${num}</span>.`);
            diceList.prepend(li);
            break;
        case 'multiple':
            li.html(`<span style="color:red;">${playerName}</span> rolou <span style="color:green;">${dices.join(', ')}</span> e 
            tirou <span style="color:green;">${results.join(', ')}</span>, somando <span style="color:green;">${sum}</span>.`);
            diceList.prepend(li);
            break;
    }

});