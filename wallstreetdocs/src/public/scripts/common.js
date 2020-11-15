const Swal = require('sweetalert2');
const $ = require("jquery");


exports.requestReport = async () => {

    var promise = new Promise((resolve, reject) => {

        $.ajax("/api/report/request", {
            method: 'get',
            complete: (response) => {
                resolve(response.responseJSON.id);
            }, error: (err) => {
                reject();
            }
        });

    });
    return promise;
}

exports.downloadReport = async (id) => {

    var promise = new Promise((resolve, reject) => {

        $.ajax(`/api/report/get/${id}`, {
            method: 'get',
            complete: (response) => {
                resolve(response.responseJSON);
            }, error: (err) => {
                reject();
            }
        });

    });
    return promise;
}

exports.showLoading = async (title, message) => {

    Swal.fire({
        title: title,
        html: message,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading()
        }
    });
}

exports.showError = async (title, message, timeoutMiliseconds) => {
    Swal.fire({
        title: title,
        html: message,
        icon: 'error'
    });
}