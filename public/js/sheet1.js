const diceRollMax = 100;
const diceResultContent = $('#diceResultContent');
diceResultContent.hide();
const diceResultDescription = $('#diceResultDescription');
diceResultDescription.hide();
const loading = $('.loading');
const goodRate = 0.5, extremeRate = 0.2;

const diceRollModal = new bootstrap.Modal($('#diceRoll')[0]);
const uploadAvatarModal = new bootstrap.Modal($('#uploadAvatar')[0]);
const generalDiceModal = new bootstrap.Modal($('#generalDiceRoll')[0]);
const addSkillModal = new bootstrap.Modal($('#addSkill')[0]);
const createSkillModal = new bootstrap.Modal($('#createSkill')[0]);
const addEquipmentModal = new bootstrap.Modal($('#addEquipment')[0]);
const createEquipmentModal = new bootstrap.Modal($('#createEquipment')[0]);
const addItemModal = new bootstrap.Modal($('#addItem')[0]);
const createItemModal = new bootstrap.Modal($('#createItem')[0]);

const failureToast = new bootstrap.Toast($('#failureToast')[0], {delay: 4000});

//General
function rollDice(num = -1, showBranches = true, callback)
{
    diceRollModal.show();
    loading.show();

    function onSuccess(data)
    {
        let roll = data.num;
        const successType = resolveSuccessType(num, roll, showBranches);
        loading.hide();
        diceResultContent.text(roll);
        diceResultContent.fadeIn('slow', () =>
        {
            if (num === -1)
                return;
            
            diceResultDescription.text(successType.description);
            diceResultDescription.fadeIn('slow');
        });
        
        if (callback)
            callback(successType);
    }

    $.ajax('/dice/single', 
    {
        data: {max: diceRollMax},
        success: onSuccess,
        error: err =>
        {
            failureToast.show();
            console.log(err);
        }
    });
}

function rollDices(dices)
{
    loading.show();
    function onSuccess(data)
    {
        let sum = data.sum;
        let results = data.results;

        loading.hide();
        diceResultContent.text(sum);
        diceResultContent.fadeIn('slow', () =>
        {
            if (results.length <= 1)
                return;
            
            diceResultDescription.text(results.join(' + '));
            diceResultDescription.fadeIn('slow');
        });
    }

    $.ajax('/dice/multiple', 
    {
        data: {dices},
        success: onSuccess,
        error: err =>
        {
            failureToast.show();
            console.log(err);
        }
    });
}

$('#diceRoll').on('hidden.bs.modal', ev =>
{
    diceResultContent.text('');
    diceResultContent.hide();
    diceResultDescription.text('');
    diceResultDescription.hide();
})

function resolveSuccessType(num, roll, showBranches)
{
    if (showBranches)
    {
        if (roll === 100)
            return {description: 'Desastre', isSuccess: false};
        if (roll === 1)
            return {description: 'Perfeito', isSuccess: true};
        if (roll <= num * extremeRate)
            return {description: 'Extremo', isSuccess: true};
        if (roll <= num * goodRate)
            return {description: 'Bom', isSuccess: true};
    }
    if (roll <= num)
        return {description: 'Sucesso', isSuccess: true};
    if (roll > num)
        return {description: 'Fracasso', isSuccess: false};

    return {description: 'Unknown', isSuccess: false};
}

function resolveDices(str)
{
    let dices = str.replace(/\s+/g, '').split('+');
    let arr = [];
    for (let i = 0; i < dices.length; i++)
    {
        const dice = dices[i];
        resolveDice(dice, arr);
    }
    return arr;
}

function resolveDice(_dice, arr)    
{
    let dice = _dice.toLowerCase();

    if(dice.includes('db'))
        return resolveDice(specs.get('Dano Bônus'), arr);
    
    let n = 0, num;

    let split = dice.split('d');

    if (split.length === 1)
        return arr.push({n, num: dice});

    n = split[0];
    if (n === '')
        n = 1;
    num = split[1];
    for (let i = 0; i < n; i++)
    {
        arr.push({n:'1', num});
    }
}

function clamp(n, min, max)
{
    if (n < min)
        return min;
    if (n > max)
        return max;
    return n;
}

function resolveAttributeBar(now, max, bar)
{
    let coeficient = (now / max) * 100;
    bar.css('width', `${coeficient}%`);
}

const generalDiceText = $('#generalDiceText');
function generalDiceClick(event)
{
    let dices = resolveDices(generalDiceText.val());
    rollDices(dices);
    generalDiceModal.hide();
    diceRollModal.show();
    generalDiceText.val('');
}

//Info
function infoChange(ev, infoID)
{
    let value = $(ev.target).val();

    $.ajax('/sheet/player/info',
    {
        method: 'POST',
        data: {infoID, value},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

//Avatar
const avatarImage = $('#avatar');
const avatarLinks = new Map();
const uploadAvatarContainer = $('#uploadAvatarContainer');
const uploadAvatarButton = $('#uploadAvatarButton');
const uploadAvatarCloseButton = $('#uploadAvatarCloseButton');
const avatarInputs = $('.upload-avatar-input');

$('#uploadAvatar').on('hidden.bs.modal', () =>
{
    uploadAvatarButton.prop('disabled', false);
    uploadAvatarCloseButton.prop('disabled', false);
    uploadAvatarContainer.show();
    avatarInputs.val('');
    loading.hide();
});

function uploadAvatarClick(event)
{
    uploadAvatarButton.prop('disabled', true);
    uploadAvatarCloseButton.prop('disabled', true);
    uploadAvatarContainer.hide();
    loading.show();

    const avatars = [];

    for (let [key, value] of avatarElements)
    {
        const id = key;
        let link = value.val();
        if (!link)
            link = null;

        const obj =
        {
            avatar_id: id,
            link: link
        };

        avatars.push(obj);
    }

    $.ajax('/avatar',
    {
        method: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(avatars),
        success: () =>
        {
            loadAvatarLinks(avatars);

            uploadAvatarModal.hide();
        },
        error: err =>
        {
            uploadAvatarModal.hide();
            console.log(err);
            failureToast.show();
        }
    });
}

function evaluateAvatar()
{
    const unc = avatarEval.get(1);
    const mw = avatarEval.get(2);
    let ins = avatarEval.get(3);
    if (!ins)
        ins = avatarEval.get(4);

    if (unc)
        return avatarImage.attr('src', avatarLinks.get(2));
    if (mw)
        return avatarImage.attr('src', (ins ? avatarLinks.get(5) : avatarLinks.get(3)));
    if (ins)
        return avatarImage.attr('src', avatarLinks.get(4));
    
    return avatarImage.attr('src', avatarLinks.get(1));

}

async function loadAvatarLinks(data)
{
    if(!data)
        data = (await $.get('/avatar')).avatars;

    for (let i = 0; i < data.length; i++)
    {
        const el = data[i];
        avatarLinks.set(el.avatar_id, el.link);
    }

    evaluateAvatar();
}
$(document).ready(() => loadAvatarLinks());

//Attributes
function attributeBarClick(ev, attributeID)
{
    let bar = $(`#attributeBar${attributeID}`);
    let desc = $(`#attributeDesc${attributeID}`);

    let split = desc.text().split('/');
    let cur = parseInt(split[0]);
    let max = parseInt(split[1]);

    let newMax = prompt('Digite o novo máximo do atributo:', max);
    let newCur = clamp(cur, 0, newMax);

    if (!newMax || isNaN(newMax))
        return;

    $.ajax('/sheet/player/attribute',
    {
        method: 'POST',
        data: {attributeID, value: newCur, maxValue: newMax},
        success : data =>
        {
            desc.text(`${newCur}/${newMax}`);
            resolveAttributeBar(newCur, newMax, bar);
        },
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function attributeIncreaseClick(ev, attributeID)
{
    const desc = $(`#attributeDesc${attributeID}`);
    const bar = $(`#attributeBar${attributeID}`);

    let diff = 1;
    if (ev.shiftKey)
        diff = 10;

    let split = desc.text().split('/');

    let cur = parseInt(split[0]);
    let max = parseInt(split[1]);
    let newCur = clamp(cur + diff, 0, max);

    desc.text(`${newCur}/${max}`);
    resolveAttributeBar(newCur, max, bar);

    $.ajax('/sheet/player/attribute',
    {
        method: 'POST',
        data: {attributeID, value: newCur, maxValue: max},
        error: err =>
        {
            desc.text(`${cur}/${max}`);
            resolveAttributeBar(cur, max, bar);
            console.log(err);
            failureToast.show();
        }
    });
}

function attributeDecreaseClick(ev, attributeID)
{
    const desc = $(`#attributeDesc${attributeID}`);
    const bar = $(`#attributeBar${attributeID}`);
    
    let diff = 1;
    if (ev.shiftKey)
        diff = 10;

    let split = desc.text().split('/');

    let cur = parseInt(split[0]);
    let max = parseInt(split[1]);
    let newCur = clamp(cur - diff, 0, max);

    desc.text(`${newCur}/${max}`);
    resolveAttributeBar(newCur, max, bar);

    $.ajax('/sheet/player/attribute',
    {
        method: 'POST',
        data: {attributeID, value: newCur, maxValue: max},
        error: err =>
        {
            desc.text(`${cur}/${max}`);
            resolveAttributeBar(cur, max, bar);
            console.log(err);
            failureToast.show();
        }
    });
}

function attributeDiceClick(ev, id)
{
    let desc = $(`#attributeDesc${id}`);
    let split = desc.text().split('/');

    let cur = parseInt(split[0]);

    rollDice(cur, false);
}

//Attribute Status
function attributeStatusChange(ev, attributeStatusID)
{
    const checked = $(ev.target).prop('checked');
    avatarEval.set(attributeStatusID, checked);
    evaluateAvatar();
    $.ajax('/sheet/player/attributestatus',
    {
        method: 'POST',
        data: {attributeStatusID, checked},
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

//Specs
function specChange(ev, specID)
 {
    let value = $(ev.target).val();
    $.ajax('/sheet/player/spec',
    {
        method: 'POST',
        data: {specID, value},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
 }

//Characteristics
function characteristicChange(ev, characteristicID)
{
    let value = $(ev.target).val();

    $.ajax('/sheet/player/characteristic',
    {
        method: 'POST',
        data: {characteristicID, value},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function characteristicDiceClick(ev, id)
{
    let num = $(`#characteristic${id}`).val();
    rollDice(num);
}

//Equipments
const equipmentTable = $('#equipmentTable');

const addEquipmentContainer = $('#addEquipmentContainer');
const addEquipmentList = $('#addEquipmentList');
const addEquipmentButton = $('#addEquipmentButton');
const addEquipmentCloseButton = $('#addEquipmentCloseButton');
const addEquipmentCreate = $('#addEquipmentCreate');

const createEquipmentContainer = $('#createEquipmentContainer');
const createEquipmentName = $('#createEquipmentName');
const createEquipmentDamage = $('#createEquipmentDamage');
const createEquipmentRange = $('#createEquipmentRange');
const createEquipmentAttacks = $('#createEquipmentAttacks');
const createEquipmentAmmo = $('#createEquipmentAmmo');
const createEquipmentMalf = $('#createEquipmentMalf');
const createEquipmentSpecialization = $('#combatSpecializationList');
const createEquipmentButton = $('#createEquipmentButton');
const createEquipmentCloseButton = $('#createEquipmentCloseButton');

$('#createEquipment').on('hidden.bs.modal', () =>
{
    createEquipmentName.val('');
    createEquipmentSpecialization.val('');
    createEquipmentDamage.val('');
    createEquipmentRange.val('');
    createEquipmentAttacks.val('');
    createEquipmentAmmo.val('');
    createEquipmentMalf.val('');
    createEquipmentContainer.show();
    createEquipmentButton.prop('disabled', false);
    createEquipmentCloseButton.prop('disabled', false);
    loading.hide();
});

$('#addEquipment').on('hidden.bs.modal', () =>
{
    addEquipmentCloseButton.prop('disabled', false);
    addEquipmentCreate.prop('disabled', false);
    addEquipmentContainer.show();
    loading.hide();
});

function addEquipmentClick(event)
{
    addEquipmentButton.prop('disabled', true);
    addEquipmentCloseButton.prop('disabled', true);
    addEquipmentCreate.prop('disabled', true);
    addEquipmentContainer.hide();
    loading.show();

    let equipmentID = addEquipmentList.val();

    $.ajax('/sheet/player/equipment',
    {
        method: 'PUT',
        data: {equipmentID},
        success: (data) =>
        {
            addEquipmentModal.hide();

            $(`#addEquipmentOption${equipmentID}`).remove();
            
            equipmentTable.append(data.html);

            addEquipmentButton.prop('disabled', addEquipmentList.children().length === 0);
        },
        error: (err) =>
        {
            addEquipmentModal.hide();
            console.log(err);
            failureToast.show();
        }
    });
}

function deleteEquipmentClick(event, equipmentID)
{
    if (!confirm("Você realmente quer remover esse equipamento?"))
        return;

    $.ajax('/sheet/player/equipment',
    {
        method: 'DELETE',
        data: {equipmentID},
        success: () =>
        {
            const opt = $(document.createElement('option'));
            opt.attr('id', `addEquipmentOption${equipmentID}`);
            opt.val(equipmentID);
            opt.text($(`#equipmentName${equipmentID}`).text());

            addEquipmentList.append(opt);
            $(`#equipmentRow${equipmentID}`).remove();

            addEquipmentButton.prop('disabled', false);
        },
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function createEquipmentClick(event)
{
    const name = createEquipmentName.val();
    const skillID = createEquipmentSpecialization.val();
    const damage = createEquipmentDamage.val();
    const range = createEquipmentRange.val();
    const attacks = createEquipmentAttacks.val();
    const ammo = createEquipmentAmmo.val();
    const malf = createEquipmentMalf.val();

    createEquipmentButton.prop('disabled', true);
    createEquipmentCloseButton.prop('disabled', true);
    createEquipmentContainer.hide();
    loading.show();

    $.ajax('/sheet/equipment',
    {
        method: 'PUT',
        data: {name, skillID, damage, range, attacks, ammo, malf},
        success: (data) =>
        {
            const id = data.equipmentID;
            const opt = $(document.createElement('option'));
            opt.attr('id', `addEquipmentOption${id}`);
            opt.val(id);
            opt.text(name);
            
            createEquipmentModal.hide();
            addEquipmentList.append(opt);
            addEquipmentButton.prop('disabled', false);
        },
        error: (err) =>
        {
            createEquipmentModal.hide();

            console.log(err);
            failureToast.show();
        }
    });
}

function equipmentUsingChange(ev, equipmentID)
{
    const currentAmmo = $(`#equipmentAmmo${equipmentID}`).val();
    const using = $(ev.target).prop('checked');
    $.ajax('/sheet/player/equipment',
    {
        method: 'POST',
        data: {equipmentID, using, currentAmmo},
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function equipmentAmmoChange(ev, equipmentID)
{
    const using = $(`#equipmentUsing${equipmentID}`).prop('checked');
    const currentAmmo = $(ev.target);

    let maxAmmo = parseInt($(`#equipmentMaxAmmo${equipmentID}`).text());

    if (isNaN(maxAmmo))
    {
        currentAmmo.val('-');
        return alert('Esse equipamento não possui munição.');
    }
    else
    {
        let curAmmo = parseInt(currentAmmo.val());
        if (curAmmo > maxAmmo)
        {
            currentAmmo.val('-');
            return alert('Você não pode ter mais balas do que a capacidade do equipamento.');
        }
    }

    $.ajax('/sheet/player/equipment',
    {
        method: 'POST',
        data: {equipmentID, using, currentAmmo: currentAmmo.val()},
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function equipmentDiceClick(ev, id)
{
    const damageField = $(`#equipmentDamage${id}`);
    const ammoTxt = $(`#equipmentAmmo${id}`);

    let ammo = parseInt(ammoTxt.val());
    let ammoPass = true;
    let maxAmmo = parseInt($(`#equipmentMaxAmmo${id}`).text());

    if (!isNaN(maxAmmo))
    {
        if (isNaN(ammo) || ammo <= 0)
            ammoPass = false;
        else
            ammoTxt.val(--ammo);
    }

    if (!ammoPass)
    {
        diceRollModal.hide();
        return alert('Você não tem munição para isso.');
    }

    diceRollModal.show();
    let dmg = resolveDices(damageField.text());
    rollDices(dmg);
}


//Skills
const skillTable = $('#skillTable');

const skillsContainer = $('.skill-container');
const skillLabels = $('.skill-label');

const addSkillContainer = $('#addSkillContainer');
const addSkillButton = $('#addSkillButton');
const addSkillCloseButton = $('#addSkillCloseButton');
const addSkillCreateButton = $('#addSkillCreateButton');
const addSkillList = $('#addSkillList');

const createSkillContainer = $('#createSkillContainer');
const createSkillButton = $('#createSkillButton');
const createSkillCloseButton = $('#createSkillCloseButton');
const createSkillName = $('#createSkillName');
const createSkillSpecialization = $('#createSkillSpecialization');

$('#createSkill').on('hidden.bs.modal', () =>
{
    createSkillSpecialization.val('');
    createSkillName.val('');
    createSkillContainer.show();
    createSkillButton.prop('disabled', false);
    createSkillCloseButton.prop('disabled', false);
    loading.hide();
});

$('#addSkill').on('hidden.bs.modal', () =>
{
    addSkillContainer.show();
    addSkillCreateButton.prop('disabled', false);
    addSkillCloseButton.prop('disabled', false);
    loading.hide();
});

function createSkillClick(event)
{
    createSkillContainer.hide();
    createSkillButton.prop('disabled', true);
    createSkillCloseButton.prop('disabled', true);
    loading.show();

    let specializationID = createSkillSpecialization.val();
    let name = createSkillName.val();

    if (specializationID === '0')
        specializationID = null;

    $.ajax('/sheet/skill',
    {
        method: 'PUT',
        data: {name, specializationID},
        success: (data) =>
        {
            createSkillModal.hide();

            const id = data.skillID;
            const opt = $(document.createElement('option'));
            opt.attr('id', `createSkillOption${id}`);
            opt.val(id);
            opt.text(name);
            addSkillList.append(opt);

            addSkillButton.prop('disabled', false);
        },
        error: (err) =>
        {
            createSkillModal.hide();

            console.log(err);
            failureToast.show();
        }
    });
}

function addSkillClick(ev)
{
    addSkillContainer.hide();
    addSkillButton.prop('disabled', true);
    addSkillCloseButton.prop('disabled', true);
    addSkillCreateButton.prop('disabled', true);
    loading.show();

    let skillID = addSkillList.val();

    $.ajax('/sheet/player/skill',
    {
        method: 'PUT',
        data: {skillID},
        success: (data) =>
        {
            addSkillModal.hide();

            $(`#addSkillOption${skillID}`).remove();
            skillTable.append(data.html);

            addSkillButton.prop('disabled', addSkillList.children().length === 0);
        },
        error: (err) =>
        {
            addSkillModal.hide();

            console.log(err);
            failureToast.show();
        }
    });
}

function containerMouseOver(ev, id)
{
    $(`#skillContainer${id}`).css('background-color', 'white');
    $(`#skillLabel${id}`).css('color', 'black');
    const txt = $(`#skill${id}`);
    txt.css('background-color', 'white');
    txt.css('color', 'black');
}

function containerMouseOut(ev, id)
{
    $(`#skillContainer${id}`).css('background-color', 'black');
    $(`#skillLabel${id}`).css('color', 'white');
    const txt = $(`#skill${id}`);
    txt.css('background-color', 'black');
    txt.css('color', 'white');
}

function skillSearchBarInput(ev)
{
    const searchBar = $(ev.target);
    
    if (searchBar.val() === '')
    {
        for (let i = 0; i < skillsContainer.length; i++)
            skillsContainer[i].hidden = false;
        return;
    }

    let str = searchBar.val().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    for (let i = 0; i < skillsContainer.length; i++)
    {
        const cont = skillsContainer[i];
        let txt = skillLabels[i].textContent.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
        cont.hidden = !txt.includes(str);
    }
}

function skillChange(event, id)
{
    const value = $(event.target).val();
    const checked = $(`skillCheck${id}`).prop('checked');

    $.ajax('/sheet/player/skill',
    {
        method: 'POST',
        data: {skillID: id, value: value, checked: checked},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function skillCheckChange(event, id)
{
    const checked = $(event.target).prop('checked');
    const value = $(`skill${id}`).val();
    
    $.ajax('/sheet/player/skill',
    {
        method: 'POST',
        data: {skillID: id, value: value, checked: checked},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function skillDiceClick(event, id)
{
    const num = $(`#skill${id}`).val();

    rollDice(parseInt(num), true, type =>
    {
        if (type.isSuccess)
        {
            const skillCheck = $(`#skillCheck${id}`);
            skillCheck.prop('checked', true);
            skillCheck.trigger('change');
        }
    });
}

//Finances
function financeChange(ev, financeID)
{
    const value = $(ev.target).val();

    $.ajax('/sheet/player/finance',
    {
        method: 'POST',
        data: {financeID, value},
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

//Items
const itemTable = $('#itemTable');

const addItemContainer = $('#addItemContainer');
const addItemButton = $('#addItemButton');
const addItemCloseButton = $('#addItemCloseButton');
const addItemCreateButton = $('#addItemCreateButton');
const addItemList = $('#addItemList');

const createItemContainer = $('#createItemContainer');
const createItemButton = $('#createItemButton');
const createItemCloseButton = $('#createItemCloseButton');
const createItemName = $('#createItemName');
const createItemDescription = $('#createItemDescription');

$('#createItem').on('hidden.bs.modal', () =>
{
    createItemName.val('');
    createItemDescription.val('');
    createItemContainer.show();
    createItemButton.prop('disabled', false);
    createItemCloseButton.prop('disabled', false);
    loading.hide();
});

$('#addItem').on('hidden.bs.modal', () =>
{
    addItemContainer.show();
    addItemCreateButton.prop('disabled', false);
    addItemCloseButton.prop('disabled', false);
    loading.hide();
});

function addItemClick(ev)
{
    addItemContainer.hide();
    addItemButton.prop('disabled', true);
    addItemCloseButton.prop('disabled', true);
    addItemCreateButton.prop('disabled', true);
    loading.show();

    let itemID = addItemList.val();
    
    $.ajax('/sheet/player/item',
    {
        method: 'PUT',
        data: {itemID},
        success: (data) =>
        {
            addItemModal.hide();

            $(`#addItemOption${itemID}`).remove();
            itemTable.append(data.html);

            addItemButton.prop('disabled', addItemList.children().length === 0);
        },
        error: (err) =>
        {
            addItemModal.hide();

            console.log(err);
            failureToast.show();
        }
    });
}

function createItemClick(ev)
{
    createItemContainer.hide();
    createItemButton.prop('disabled', true);
    createItemCloseButton.prop('disabled', true);
    loading.show();

    const name = createItemName.val();
    const description = createItemDescription.val();
    $.ajax('/sheet/item',
    {
        method: 'PUT',
        data: {name, description},
        success: (data) =>
        {
            createItemModal.hide();

            const id = data.itemID;
            const opt = $(document.createElement('option'));
            opt.attr('id', `addItemOption${id}`);
            opt.val(id);
            opt.text(name);
            addItemList.append(opt);

            addItemButton.prop('disabled', false);
        },
        error: (err) =>
        {
            createItemModal.hide();

            console.log(err);
            failureToast.show();
        }
    });
}

function deleteItemClick(event, itemID)
{
    if (!confirm("Você realmente quer remover esse equipamento?"))
        return;

    $.ajax('/sheet/player/item',
    {
        method: 'DELETE',
        data: {itemID},
        success: (data) =>
        {
            const opt = $(document.createElement('option'));
            opt.attr('id', `addItemOption${itemID}`);
            opt.val(itemID);
            opt.text($(`#itemName${itemID}`).text());
            addItemList.append(opt);

            $(`#itemRow${itemID}`).remove();
            
            addItemButton.prop('disabled', false);
        },
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}

function itemDescriptionChange(ev, itemID)
{
    const description = $(ev.target).val();

    $.ajax('/sheet/player/item',
    {
        method: 'POST',
        data: {itemID, description},
        error: (err) =>
        {
            console.log(err);
            failureToast.show();
        }
    })
}