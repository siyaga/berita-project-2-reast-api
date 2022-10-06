const fs = require('fs');

let key= fs.readFileSync('C:/Users/ASUS/Documents/bootcamprapid/day1/project11/certs/key.pem');

module.exports = {
    secret:key
}