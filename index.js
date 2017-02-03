var express = require('express')
var path = require('path')
var fileUpload = require('express-fileupload');

var fs = require('fs')
var jQuery = require("jquery")
var jsdom = require("jsdom")

var crypto = require('crypto')
var Iconv = require('iconv').Iconv

var app = express()

app.use(fileUpload());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/index.html"))
})

app.post('/decrypt', function (req, res) {

    jsdom.env(
        req.files.paper.data.toString(),

        function (err, window) {

            var $ = jQuery(window)

            var encrypted = $("input[name*='_viewData']").attr("value")
            var decrypted = decryptPayPaper(req.body.password, encrypted)

            // hack: force replace 'EUC-KR' => 'UTF-8'
            decrypted = decrypted.replace('EUC-KR', 'UTF-8')

            // send response
            res.send(decrypted) 
        }
    )
})
 
app.listen(process.env.PORT || 3000)

function decryptPayPaper (password, encrypted) {

    // read blob from base64 encoded string
    var blob = Buffer.from(encrypted, 'base64')

    // find Initialization Vector, Salt, Content from Encrypted blob
    var IV = blob.slice(56 + 2, 56 + 2 + 8)
    var salt = blob.slice(66 + 2, 66 + 2 + 16)

    var content = blob.slice(84 + 4, blob.length)

    // convert password into UNICODE string
    var iconv = new Iconv('utf-8', 'UTF-16LE')
    password = Buffer.from(password)
    password = iconv.convert(password)

    var key = hashSaltPassword(salt, password)

    // decrypt
    var decipher = crypto.createDecipheriv('rc2-cbc', key, IV)
    var decrypted1 = decipher.update(content)
    var decrypted2 = decipher.final()

    var decrypted = Buffer.concat([decrypted1, decrypted2])

    // convert 'decrypted' to utf8 string, from utf-16 Little Endian
    var iconv = new Iconv('UTF-16LE', 'utf-8')
    var decryptedUtf8 = iconv.convert(decrypted).toString()

    return decryptedUtf8
}

function hashSaltPassword (salt, password) {

    const hash = crypto.createHash("SHA1")

    hash.update(password)
    hash.update(salt)

    var saltedKey = hash.digest().slice(0, 16)
    return saltedKey
}
