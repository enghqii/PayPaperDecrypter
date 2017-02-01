var express = require('express')
var app = express()
var path = require('path')
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/index.html"))
})

app.post('/', function (req, res) {
    console.log(req.body);
    res.sendFile(path.join(__dirname + "/index.html"))
})
 
app.listen(3000)