const loading = $('.loading');
const createSkillModal = new bootstrap.Modal($('#createSkill')[0]);
const createEquipmentModal = new bootstrap.Modal($('#createEquipment')[0]);
const createItemModal = new bootstrap.Modal($('#createItem')[0]);

const failureToast = new bootstrap.Toast($('#failureToast')[0], { delay: 4000 });
const failureToastBody = $('#failureToast > .toast-body');

//General
function showFailureToastMessage(err) {
    console.log(err);
    failureToastBody.text(`Erro ao tentar aplicar mudança - ${err.text}`);
    failureToast.show();
}

//Equipments
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

$('#createEquipment').on('hidden.bs.modal', () => {
    createEquipmentButton.prop('disabled', false);
    createEquipmentCloseButton.prop('disabled', false);
    createEquipmentContainer.show();
    loading.hide();
});

function createEquipmentClick(event) {
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
            data: { name, skillID, damage, range, attacks, ammo, malf },
            success: (data) => {
                const id = data.equipmentID;
                const tr = $(document.createElement('tr'));

                tr.attr('id', `equipmentRow${id}`)
                    .html(`
            <td>
                <button class="acds-element"
                    onclick="equipmentDeleteClick(event, ${id})"><i
                        class="bi bi-trash"></i></button>
            </td>
            <td>
                <input style="background-color: black; color: white;" class="acds-bottom-text"
                    type="text" value="${name}"
                    onchange="equipmentNameChange(event, ${id})">
            </td>
            <td>
                <select style="background-color: black; color: gray;">
                    <option value="${skillID}" selected>Recarregue a página</option>
                </select>
            </td>
            <td>
                <input style="background-color: black; color: white;" class="acds-bottom-text"
                    type="text" value="${damage}"
                    onchange="equipmentDamageChange(event, ${id})">
            </td>
            <td>
                <input style="background-color: black; color: white; max-width: 120px;"
                    class="acds-bottom-text" type="text" value="${range}"
                    onchange="equipmentRangeChange(event, ${id})">
            </td>
            <td>
                <input style="background-color: black; color: white; max-width: 120px;"
                    class="acds-bottom-text" type="text" value="${attacks}"
                    onchange="equipmentAttacksChange(event, ${id})">
            </td>
            <td>
                <input style="background-color: black; color: white; max-width: 40px;"
                    class="acds-bottom-text" type="text" value="${ammo}"
                    onchange="equipmentAmmoChange(event, ${id})">
            </td>
            <td>
                <input style="background-color: black; color: white; max-width: 40px;"
                    class="acds-bottom-text" type="text" value="${malf}" maxlength="3"
                    onchange="equipmentMalfuncChange(event, ${id})">
            </td>
            `);
                $('#equipmentListTable').append(tr);

                createEquipmentModal.hide();
            },
            error: (err) => {
                createEquipmentModal.hide();
                showFailureToastMessage(err)
            }
        });
}

function equipmentDeleteClick(event, id) {
    if (!confirm("Você realmente quer remover esse equipamento?"))
        return;

    $.ajax('/sheet/equipment',
        {
            method: 'DELETE',
            data: { equipmentID: id },
            success: () => $(`#equipmentRow${id}`).remove(),
            error: showFailureToastMessage
        })
}

function equipmentNameChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, name: value },
            error: showFailureToastMessage
        });
}

function equipmentSkillChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, skillID: value },
            error: showFailureToastMessage
        });
}

function equipmentDamageChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, damage: value },
            error: showFailureToastMessage
        });
}

function equipmentRangeChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, range: value },
            error: showFailureToastMessage
        });
}

function equipmentAttacksChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, attacks: value },
            error: showFailureToastMessage
        });
}

function equipmentAmmoChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, ammo: value },
            error: showFailureToastMessage
        });
}

function equipmentMalfuncChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/equipment',
        {
            method: 'POST',
            data: { equipmentID: id, malfunc: value },
            error: showFailureToastMessage
        });
}

//Skills
const createSkillContainer = $('#createSkillContainer');
const createSkillButton = $('#createSkillButton');
const createSkillCloseButton = $('#createSkillCloseButton');
const createSkillName = $('#createSkillName');
const createSkillSpecialization = $('#createSkillSpecialization');

$('#createSkill').on('hidden.bs.modal', () => {
    createSkillButton.prop('disabled', false);
    createSkillCloseButton.prop('disabled', false);
    createSkillContainer.show();
    loading.hide();
});

function createSkillClick(event) {
    createSkillContainer.hide();
    createSkillButton.prop('disabled', true);
    createSkillCloseButton.prop('disabled', true);
    loading.show();

    let specializationID = createSkillSpecialization.val();
    let name = createSkillName.val();

    $.ajax('/sheet/skill',
        {
            method: 'PUT',
            data: { name, specializationID },
            success: (data) => {
                createSkillModal.hide();
                const id = data.skillID;
                const tr = $(document.createElement('tr'));

                tr.attr('id', `skillRow${id}`)
                    .html(`
            <td>
            <button class="acds-element" onclick="skillDeleteClick(event, ${id})"><i
                    class="bi bi-trash"></i></button>
            </td>
            <td>
                <input style="background-color: black; color: white;" class="acds-bottom-text"
                    type="text" value="${name}"
                    onchange="skillNameChange(event, ${id})">
            </td>
            <td>
                <select style="background-color: black; color: gray;">
                    <option value="${specializationID}" selected>Recarregue a página</option>
                </select>
            </td>
            <td>
                <input style="background-color: black; color: white; max-width: 40px;"
                    class="acds-bottom-text" maxlength="3" type="text" value="1"
                    onchange="skillStartValueChange(event, ${id})">
            </td>
            <td>
                <input class="form-check-input" type="checkbox"
                    onchange="skillMandatoryChange(event, ${id})">
            </td>
            `);
                $('#skillListTable').append(tr);
            },
            error: (err) => {
                createSkillModal.hide();
                showFailureToastMessage(err)
            }
        });
}

function skillDeleteClick(event, id) {
    if (!confirm("Você realmente quer remover essa perícia?"))
        return;

    $.ajax('/sheet/skill',
        {
            method: 'DELETE',
            data: { skillID: id },
            success: () => $(`#skillRow${id}`).remove(),
            error: showFailureToastMessage
        })
}

function skillNameChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/skill',
        {
            method: 'POST',
            data: { skillID: id, name: value },
            error: showFailureToastMessage
        });
}

function skillSpecializationChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/skill',
        {
            method: 'POST',
            data: { skillID: id, specializationID: value },
            error: showFailureToastMessage
        });
}

function skillStartValueChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/skill',
        {
            method: 'POST',
            data: { skillID: id, startValue: value },
            error: showFailureToastMessage
        });
}

function skillMandatoryChange(event, id) {
    const value = $(event.target).prop('checked');

    $.ajax('/sheet/skill',
        {
            method: 'POST',
            data: { skillID: id, mandatory: value },
            error: showFailureToastMessage
        });
}

//Item
const createItemContainer = $('#createItemContainer');
const createItemButton = $('#createItemButton');
const createItemCloseButton = $('#createItemCloseButton');
const createItemName = $('#createItemName');
const createItemDescription = $('#createItemDescription');

$('#createItem').on('hidden.bs.modal', () => {
    createItemButton.prop('disabled', false);
    createItemCloseButton.prop('disabled', false);
    createItemContainer.show();
    loading.hide();
});

function createItemClick(ev) {
    createItemContainer.hide();
    createItemButton.prop('disabled', true);
    createItemCloseButton.prop('disabled', true);
    loading.show();

    const name = createItemName.val();
    const description = createItemDescription.val();

    $.ajax('/sheet/item',
        {
            method: 'PUT',
            data: { name, description },
            success: (data) => {
                createItemModal.hide();
                const id = data.itemID;

                const tr = $(document.createElement('tr'));
                tr.attr('id', `itemRow${id}`)
                    .html(`
            <td>
                <button class="acds-element" onclick="itemDeleteClick(event, ${id})"><i
                        class="bi bi-trash"></i></button>
            </td>
            <td>
                <input style="background-color: black; color: white;" class="acds-bottom-text"
                    type="text" value="${name}" onchange="itemNameChange(event, ${id})">
            </td>
            <td>
                <input style="background-color: black; color: white;" class="acds-bottom-text"
                type="text" value="${description}"
                onchange="itemDescriptionChange(event, ${id})">
            </td>
            `);
                $('#itemListTable').append(tr);
            },
            error: (err) => {
                createItemModal.hide();
                showFailureToastMessage(err);
            }
        });
}

function itemDeleteClick(event, id) {
    if (!confirm("Você realmente quer remover esse item?"))
        return;

    $.ajax('/sheet/item',
        {
            method: 'DELETE',
            data: { itemID: id },
            success: () => $(`#itemRow${id}`).remove(),
            error: showFailureToastMessage
        })
}

function itemNameChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/item',
        {
            method: 'POST',
            data: { itemID: id, name: value },
            error: showFailureToastMessage
        });
}

function itemDescriptionChange(event, id) {
    const value = $(event.target).val();

    $.ajax('/sheet/item',
        {
            method: 'POST',
            data: { itemID: id, description: value },
            error: showFailureToastMessage
        });
}