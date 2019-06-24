/*
* Imports
* */
const SchoolModel = require('../../models/school.model')
const CityModel = require('../../models/city.model')
const fs = require('fs')
const { getTranscription } = require('../../services/googleSpeech')
const levenshtein = require('js-levenshtein')


/*
* Méthodes
* */
const detectName = buffer => {

    return new Promise( (resolve, reject) => {

        // enregistre le fichier
        fs.writeFile( './server/public/audio.wav', buffer, async function(err) {

            // erreur filesystem
            if(err) reject({status: 'error', message: 'Une erreur est survenue'})

            // détecter le mot
            else {

                const transcription = await getTranscription(['bonjour', 'je', 'm\'appelle', 'euh'])
                resolve({status: 'success', message: transcription})
            }
        });

    })
}

const detectCity = (buffer, position) => {

    return new Promise( (resolve, reject) => {

        // enregistre le fichier
        fs.writeFile( './server/public/audio.wav', buffer, async function(err) {

            // erreur filesystem
            if(err) reject({status: 'error', message: 'Une erreur est survenue'})

            // détecter le mot
            else {

                // récupère le mot
                const transcription = await getTranscription(['j\'habite', 'à', 'je', 'vis', 'maison', 'appartement'])
                const transcriptionString = transcription.toString().replace(',', ' ').toLocaleLowerCase()

                // récupère les villes les plus proches de la position
                CityModel.find(
                    {
                        $or:
                        [
                            {
                                "latitude" : { $gte :  position.lat - 1 / 10, $lte : position.lat + 1 / 10},
                                "longitude" : { $gte :  position.long - 1 / 10, $lte : position.long + 1 / 10}
                            },
                            {
                                "latitude" : null,
                                "longitude" : null
                            }
                        ]
                    },
                    (error, cities) => {

                        // si erreur
                        if (error) reject({status: 'error', message: 'Une erreur est survenue'})

                        let finalCity = {
                            index: Infinity,
                            name: transcriptionString
                        }

                        // compare les villes avec le mot prononcé
                        for(let i = 0; i < cities.length; i++) {

                            const levenshteinIndex = levenshtein(cities[i].nom_commune, transcriptionString )

                            if ( levenshteinIndex < finalCity.index ) {
                                finalCity.index = levenshteinIndex
                                finalCity.name = cities[i].nom_commune
                            }
                        }

                        // retourne la ville séléectionée
                        resolve({status: 'success', message: finalCity.name})
                    })
            }
        })
    })
}

/*
* Export
* */
module.exports = { detectName, detectCity }