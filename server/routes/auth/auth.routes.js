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

    constructor({passport}) {
        this.passport = passport
    }

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

        authRouter.get('/logout',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                console.log('in logout')

                res.cookie(process.env.COOKIE_NAME, null, {httpOnly: true});
                res.json({status: 'success', message: 'ok logout'})
            })

        authRouter.get('/',
            this.passport.authenticate('jwt', { session: false }),
            (req, res) => {

                console.log('in has cookie')

                res.json({status: 'success', message: 'ok cookie'})
            })
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