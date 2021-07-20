socket.on('info changed', content =>
{
    let playerID = content.playerID;
    let infoID = content.infoID;
    let value = content.value;

    let element = $(`#info-${playerID}-${infoID}`);

    if (element.length === 0)
        return;

    element.text(value);
});

socket.on('attribute changed', content =>
{
    let playerID = content.playerID;
    let attrID = content.attributeID;
    let value = content.value;
    let maxValue = content.maxValue;

    let element = $(`#attribute-${playerID}-${attrID}`);

    if (element.length === 0)
        return;

    element.text(`${value}/${maxValue}`);
});

socket.on('new item', content =>
{
    let playerID = content.playerID;
    let itemID = content.itemID;
    let name = content.name;
    console.log('new item');

    let newRow = document.createElement('tr');
    newRow.id = `item-${playerID}-${itemID}`;

    let newData = document.createElement('td');
    newData.textContent = name;

    newRow.append(newData);

    let table = $(`#tableBody-${playerID}`);
    table.append(newRow);
});

socket.on('delete item', content =>
{
    let playerID = content.playerID;
    let itemID = content.itemID;

    let item = $(`#item-${playerID}-${itemID}`);
    item.remove();
});

socket.on('char changed', content =>
{
    let playerID = content.playerID;
    let charID = content.charID;
    let value = content.value;

    let element = $(`#characteristic-${playerID}-${charID}`);

    if (element.length === 0)
        return;

    element.text(value);
});