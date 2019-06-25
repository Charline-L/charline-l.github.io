/*
* Imports
* */
const express       = require("express")
const childRouter   = express.Router()
const { detectName, detectCity, detectSchool, schoolPossibilities, saveInfos, getAccounts, saveAvatar } = require('./child.controller')
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

        childRouter.post('/detect-city',
            this.passport.authenticate('jwt', { session: false }),
            upload.single('audio'),
            (req, res) => {

                detectCity(req.file.buffer, JSON.parse(req.body.position))
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        childRouter.post('/detect-school',
            this.passport.authenticate('jwt', { session: false }),
            upload.single('audio'),
            (req, res) => {

                detectSchool(req.file.buffer, JSON.parse(req.body.schools))
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        childRouter.post('/school-possibilities',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                schoolPossibilities(req.body.city)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        childRouter.post('/',
            this.passport.authenticate('jwt', { session: false }),
            upload.single('audio'),
            (req, res) => {

                saveInfos(JSON.parse(req.body.infos), req.user._id)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        childRouter.get('/accounts',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                getAccounts(req.user._id)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        childRouter.post('/save-avatar',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                saveAvatar(req.body)
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