const fs = require('fs');

let key= fs.readFileSync('C:/Users/ASUS/Documents/bootcamprapid/finalproject/berita-project-2/carts/key.pem');

module.exports = {
    secret:key
}