const os = require('os');
const networkInterfaces = os.networkInterfaces();
const IP = networkInterfaces['Wi-Fi'].find((x) => x.family === 'IPv4').address
module.exports = IP