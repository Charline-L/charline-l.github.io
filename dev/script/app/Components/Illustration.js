class Illustration {

    constructor(props) {

        this.$container = props.$container
        this.$audio = document.getElementById("audioBodymoving")

        this.init()
    }

    init() {

        this.setUpAnimation()
        this.bindEvents()
    }

    setUpAnimation() {

        const params = {
            container: this.$container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../assets/bodymoving/walk/data.json'
        }

        this.anim = lottie.loadAnimation(params)
    }

    bindEvents() {

        // si click stop animation et parle
        this.$container.addEventListener('click', () => {

            // stop
            this.anim.pause()

            // parle
            this.$audio.currentTime = 0
            this.$audio.play()

            const scopeIllustration = this

            setTimeout(() => {
                scopeIllustration.$audio.pause()
                scopeIllustration.anim.play()
            }, 3500)
        })

        // fin audio

        // this.$audio.addEventListener("ended", () => {
        //     this.anim.play()
        // })
    }
}