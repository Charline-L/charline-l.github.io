/*
* Imports
* */
const express       = require("express")
const childRouter   = express.Router()
const { detectName } = require('./child.controller')
const multer        = require('multer')

/*
* Définition de Mutler
* */
const upload = multer()

/*
* Définition des routes
* */
class ChildRouterClass {

    constructor({passport}) {
        this.passport = passport
    }

    routes(){

        childRouter.get('/',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                res.json({status: 'success', message: 'ok get'})
            })

        childRouter.post('/detect-name',
            this.passport.authenticate('jwt', { session: false }),
            upload.single('audio'),
            (req, res) => {

                detectName(req.file.buffer)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

    }

    init(){
        this.routes()
        return childRouter
    }
}

/*
* Export
* */
module.exports = ChildRouterClass