const failureToast = new bootstrap.Toast($('#failureToast')[0], {delay: 5000});

function extraInfoChange(event, extraInfoID)
{
    let value = $(event.target).val();

    $.ajax('/sheet/player/extrainfo',
    {
        method: 'POST',
        data: {extraInfoID, value},
        error: err =>
        {
            console.log(err);
            failureToast.show();
        }
    });
}