/*
* Imports
* */
const express = require("express")
const authRouter = express.Router()
const { register, login } = require('./auth.controller')

/*
* Définition des routes
* */
class AuthRouterClass {

    routes(){

        authRouter.post('/register',
            (req, res) => {

                register(req.body, res)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        authRouter.post('/login',
            (req, res) => {

                login(req.body, res)
                    .then(apiResponse => res.json(apiResponse))
                    .catch(apiResponse => res.json(apiResponse))
            })

        // TODO : lougout

        // TODO : vérifier connexion avant chaque route
    }

    init(){
        this.routes()
        return authRouter
    }
}

/*
* Export
* */
module.exports = AuthRouterClass