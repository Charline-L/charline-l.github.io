/*
* Imports
* */
require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const port = process.env.PORT
const server = express()
const { mainRouter } = require("./routes/main.router")
const db = require('./services/db')
const cookieParser = require('cookie-parser')
const path = require('path')
const cors = require('cors')

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
    server.use(cors())

    // router
    server.use('/', mainRouter)

    // assets
    server.use('/public', express.static(path.join(__dirname, 'public')))

    // lance
    server.listen(port, () => {console.log(`Server is running on port ${port}`)})
}


/*
* Démarre le server
* */
init()