/*
* Imports
* */
const { Router } = require("express")
const AuthRouterClass = require("./auth/auth.routes")
const ChildRouterClass = require("./child/child.routes")
const passport = require('passport');

/*
* Vérification Passport
* */
const { setAuthentication } = require('../services/auth');
setAuthentication(passport);

/*
* Définir les routes
* */
const mainRouter = Router()
const authRouter = new AuthRouterClass({passport})
const childRouter = new ChildRouterClass({passport})

/*
* Configure les routes
* */
mainRouter.use("/auth", authRouter.init())
mainRouter.use("/child", childRouter.init())

/*
* Route entrée
* */
mainRouter.get('/', (req, res) => {

    res.json({
        register_user: 'auth/register',
        login_user: 'auth/login',
    })
})

/*
* Export
* */
module.exports = { mainRouter }