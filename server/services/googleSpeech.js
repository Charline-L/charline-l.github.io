/*
* Imports
* */
const fs        = require('fs')
const speech    = require('@google-cloud/speech')

/*
* Configuration
* */
const getTranscription = async (uselessWords) => {

    // Creates a client
    const client = new speech.SpeechClient();

    // The name of the audio file to transcribe
    const fileName = './server/public/audio.wav';

    // Reads a local audio file and converts it to base64
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');

    // The audio file's encoding, sample rate in hertz, and BCP-47 language code
    const audio = {
        content: audioBytes,
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: 'fr-FR',
        model: 'default',
    };
    const request = {
        audio: audio,
        config: config,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

    // enlève le mots "inutiles"
    const transcriptionArray = transcription.split(' ')
    let finalWords = []

    for (let i = 0; i < transcriptionArray.length; i++) {

        if (uselessWords.indexOf(transcriptionArray[i].toLocaleLowerCase()) < 0 ) finalWords.push(transcriptionArray[i])
    }

    return finalWords
}


/*
* Exports
* */
module.exports = { getTranscription }