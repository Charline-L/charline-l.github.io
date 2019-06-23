/*
* Imports
* */
const { Router } = require("express")
const AuthRouterClass = require("./auth/auth.routes")

/*
* Définir les routes
* */
const mainRouter = Router()
const authRouter = new AuthRouterClass()

/*
* Configure les routes
* */
mainRouter.use("/auth", authRouter.init())

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