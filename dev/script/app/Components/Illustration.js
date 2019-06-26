class Illustration {
    constructor(props) {

        this.$container = props.$container
        this.$audio = document.getElementById("audio")

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
            this.$audio.play()
        })

        // fin audio
        this.$audio.addEventListener("ended", () => {
            this.anim.play()
        })
    }
}