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

    // CORS
    const whitelist = ['https://10.30.21.24:8000', 'https://192.168.1.75:8000','https://192.168.1.55:8000', 'https://charline-l.github.io']
    const corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                console.log('origin', origin)

                // FIX dégeu cors
                callback(null, true)

                // callback(new Error('Not allowed by CORS'))
            }
        },
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        optionsSuccessStatus: 200,
        credentials: true
    }
    server.use(cors(corsOptions))

    // body parser paramétrage
    server.use(bodyParser.json({limit: '50mb'}));
    server.use(bodyParser.urlencoded({ extended: true, limit:'50mb'}));

    // cookie parser paramétrage
    server.use(cookieParser())

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