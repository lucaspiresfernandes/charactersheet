const failureToast = new bootstrap.Toast($('#failureToast')[0], { delay: 4000 });
const failureToastBody = $('#failureToast > .toast-body');

//General
function showFailureToastMessage(err) {
    console.log(err);
    failureToastBody.text(`Erro ao tentar aplicar mudança - ${err.text}`);
    failureToast.show();
}

function extraInfoChange(event, extraInfoID) {
    let value = $(event.target).val();

    $.ajax('/sheet/player/extrainfo',
        {
            method: 'POST',
            data: { extraInfoID, value },
            error: showFailureToastMessage
        });
}