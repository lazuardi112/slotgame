const midtransClient = require('midtrans-client');

let coreApi;

function init(serverKey, isProduction) {
    coreApi = new midtransClient.CoreApi({
        isProduction: isProduction,
        serverKey: serverKey,
        clientKey: 'YOUR_CLIENT_KEY' // Ganti dengan kunci klien Anda
    });
}

function getCoreApi() {
    return coreApi;
}

module.exports = {
    init,
    getCoreApi
};
