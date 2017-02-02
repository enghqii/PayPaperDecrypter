var express = require('express')
var app = express()

var path = require('path')
var bodyParser = require('body-parser')
var busboy = require('express-busboy')
var fs = require('fs')

var crypto = require('crypto')
var Iconv = require('iconv').Iconv

// app.use(bodyParser.json()); // support json encoded bodies
// app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// busboy.extend(app, {
//     upload: true,
// });

// app.get('/', function (req, res) {
//     res.sendFile(path.join(__dirname + "/index.html"))
// })

// app.post('/', function (req, res) {
//     // console.log(req.body);
//     console.log(req.body);
//     res.sendFile(path.join(__dirname + "/index.html"))
// })
 
// app.listen(3000)

function HashSaltPassword(salt, password) {

    const hash = crypto.createHmac("sha1", salt)
    hash.update(password)

    var saltedKey = hash.digest().slice(0, 16)
    return saltedKey
}

fs.readFile('encrypted.txt', function (err, data) {

    if (err) {
        return console.error(err)
    }

    var encrypted = data.toString()
    var blob = Buffer.from(encrypted, 'base64')

    var IV = blob.slice(56 + 2, 56 + 2 + 8)
    var salt = blob.slice(66 + 2, 66 + 2 + 16)

    var content = blob.slice(84 + 4, blob.length)

    var keyByte = [0x84, 0x2b, 0xb0, 0x0d, 0x09, 0xC8, 0x0F, 0xb9, 0xa5, 0xd1, 0x2c, 0x73, 0x90, 0x53, 0xe4, 0x8f]
    var key = Buffer.from(keyByte)

    // decrypt
    var decipher = crypto.createDecipheriv('rc2-cbc', key, IV)
    var decrypted1 = decipher.update(content)
    var decrypted2 = decipher.final()

    var decrypted = Buffer.concat([decrypted1, decrypted2])

    // convert 'decrypted' utf8 string from utf-16 Little Endian
    var iconv = new Iconv('UTF-16LE', 'utf-8')
    var utfDecrypted = iconv.convert(decrypted).toString()

    fs.writeFile("outout_utf8.txt", Buffer.from(utfDecrypted), function (err) {

    })

})