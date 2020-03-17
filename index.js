const express = require('express')
const bodyParser = require('body-parser')
const sandbox = require("./sandboxes/sandbox.js")

const app = express()
const port = 3000
const languages = require('./languages.json')

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/languages", (req, res) => res.send(languages))

app.get('/embed', (req, res) => res.render("index", { languages: languages }))

app.post('/compile', function (req, res) {
    var results = sandbox.send(req.body);
    res.json({
        "status": "ok",
        "data": req.body,
        "results": results
    })
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))