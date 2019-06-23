/*
* Imports
* */
const UserModel = require('../../models/user.model')
const bcrypt = require('bcrypt')
const EmailValidator = require('email-deep-validator')
const emailValidator = new EmailValidator()


/*
* Méthodes
* */
const register = (body, res) => {

    // intégration du système de promesse
    return new Promise( async (resolve, reject) => {

        // enlève les espaces
        body.email = body.email.trim()
        body.password = body.password.trim()
        body.firstName = body.firstName.trim()
        body.lastName = body.lastName.trim()

        // vérifie que l'email envoyé est bien un format email
        const isEmail = await verifyMail(body.email)

        if (!isEmail) reject({status: "error", message: "Le mail envoyé n'est pas valide"})
        else {

            UserModel.findOne( {email: body.email}, (error, user) => {

                if (error) reject({status: "error", message: `Erreur connexion ${error}`})
                else if (user) reject({status: "error", message: "L'utilsateur existe déjà"})
                else {

                    // vérifie que les mots de passe sont égaux
                    if (body.password !== body.confirmPassword ) reject({status: "error", message: 'Les mots de passe ne sont pas identiques'})

                    else {

                        // hash du mot de passe de l'utilisateur
                        bcrypt.hash( body.password, 10 )
                            .then( hashedPassword => {

                                // reset la valeur avec le hash
                                body.password = hashedPassword

                                // enregistre l'utilisateur
                                UserModel.create(body)
                                    .then( async user => {

                                        // ajoute le cookie
                                        res.cookie(process.env.COOKIE_NAME, user.generateJwt(), { httpOnly: true });

                                        // envoie l'utilsateur complet
                                        resolve({ status: "success", message: 'Utilisateur connecté' })
                                    })
                                    .catch( mongoResponse => reject({status: "error", message: mongoResponse}) )
                            })
                            .catch( hashError => reject({status: "error", message: hashError}))
                    }
                }
            })
        }
    })
}


const login = (body, res) => {

    return new Promise( (resolve, reject) => {

        UserModel.findOne( {email: body.email}, async (error, user) => {

            // vérifie si error
            if (error) reject({status: 'error', message: error})
            if (!user) reject({status: 'error', message: 'L\'adresse mail n\'existe pas'})
            else {

                // vérifier le mot de passe
                const validPassword = bcrypt.compareSync(body.password, user.password)

                // renvoit la réponse
                if (!validPassword) reject({status: 'error', message: 'Mot de passe incorrect'})
                else {

                    // met le token dans un cookie
                    const token = user.generateJwt()
                    res.cookie(process.env.COOKIE_NAME, token, { httpOnly: true });

                    resolve({ status: "success", message: 'Utilisateur connecté' })
                }
            }
        })
    })
}

const verifyMail = async (email) => {

    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (re.test(String(email).toLowerCase())) {

        const { wellFormed, validDomain } = await emailValidator.verify(email)
        if (wellFormed && validDomain) return true
    }
    return false
}

/*
* Export
* */
module.exports = { register, login }