const Swal = require('sweetalert2');
const $ = require("jquery");

//this method makes a call to server for request a report
exports.requestReport = async () => {

    //create a promise for async operation
    var promise = new Promise((resolve, reject) => {
        //make the ajax call
        $.ajax("/api/report/request", {
            method: 'get',
            complete: (response) => {
                //resolve the promise when successful
                resolve(response.responseJSON.id);
                //handle errors
            }, error: (err) => {
                //reject the promise
                reject();
            }
        });

    });
    //return the promise
    return promise;
}

//this metod makes a call to server for download the report by given job id
exports.downloadReport = async (id) => {

    //create a promise for async operation
    var promise = new Promise((resolve, reject) => {
        //make the ajax call
        $.ajax(`/api/report/get/${id}`, {
            method: 'get',
            complete: (response) => {
                //resolve the promise when successful
                resolve(response.responseJSON);
                //handle errors
            }, error: (err) => {
                //reject the promise
                reject();
            }
        });

    });
    //return the promise
    return promise;
}

//this methods shows a loading popup and blocks the screen by using given arguments
exports.showLoading = async (title, message) => {
    //show the popup by using given arguments 
    Swal.fire({
        title: title,
        html: message,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
            Swal.showLoading()
        }
    });
}

//this methods shows a error popup and blocks the screen by using given arguments
exports.showError = async (title, message, timeoutMiliseconds) => {
    //show the popup by using given arguments 
    Swal.fire({
        title: title,
        html: message,
        icon: 'error',
        allowOutsideClick: false
    });
}