/*
* Imports
* */
require('dotenv').config()
const express = require("express")
const https = require('https')
const bodyParser = require("body-parser")
const port = process.env.PORT
const server = express()
const { mainRouter } = require("./routes/main.router")
const db = require('./services/db')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')
const fs = require('fs')

const key = fs.readFileSync(__dirname + '/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/selfsigned.crt');
const options = {
    key: key,
    cert: cert
};

/*
* Initialisation du serveur
* */
const init = () => {

    // Mongo
    db.connect()

    // body parser paramétrage
    server.use(bodyParser.json({limit: '10mb'}));
    server.use(bodyParser.urlencoded({ extended: true }));

    // cookie parser paramétrage
    server.use(cookieParser())

    // CORS *
    server.use(cors(
        {
            origin: [
                process.env.CLIENT,
            ],
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
            optionsSuccessStatus: 200,
            credentials: true
        }
    ))

    // router
    server.use('/', mainRouter)

    // assets
    server.use('/public', express.static(path.join(__dirname, 'public')))

    // lance server en https
    const serverhttps = https.createServer(options, server)
    serverhttps.listen(port, () => {
        console.log("server starting on port : " + port)
    });
}


/*
* Démarre le server
* */
init()