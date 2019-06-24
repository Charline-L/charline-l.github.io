/*
* Imports
* */
const fs = require('fs')
const { getTranscription } = require('../../services/googleSpeech');


/*
* Méthodes
* */
const detectName = buffer => {

    return new Promise( (resolve, reject) => {

        // enregistre le fichier
        fs.writeFile( './server/public/audio.wav', buffer, async function(err) {
            if(err) reject({status: 'error', message: 'Une erreur est survenue'});

            // détecter le mot
            else {

                const transcription = await getTranscription(['bonjour', 'je', 'm\'appelle', 'euh'])
                resolve({status: 'success', message: transcription})
            }
        });

    })
}

/*
* Export
* */
module.exports = { detectName }