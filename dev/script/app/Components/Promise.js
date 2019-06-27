class Promise {

    constructor(props) {

        this.$container = props.$container
        this.$path = this.$container.querySelector('.p-home-promise__path path')
        this.$dot = this.$container.querySelector('.p-home-promise__dot')
        this.$finish = this.$container.querySelector('.p-home-promise__finish')
        this.$animationContainer = this.$container.querySelector('.p-home-promise__animation')
        this.$thanks = this.$container.querySelector('.p-home-promise__thanks')
        this.$title = this.$container.querySelector('.p-home-promise__container-title')

        this.$activity = document.querySelector('.p-home-activity')
        this.$page = document.querySelector('.p-home')

        this.$openPromise = document.querySelector('.p-home__open-promise')

        this.isTouching = false
        this.oldPosition = {
            x: null,
            y: null
        }

        this.ww = window.innerWidth

        this.init()
    }

    init() {

        this.setUpSlide()
        this.setUpAnimation()
        this.getFinishPosition()
        this.bindEvents()
    }

    bindEvents() {

        // touch et drag
        this.$path.addEventListener('touchstart', e => {

            this.isTouching = true

            this.oldPosition.x = e.pageX
            this.oldPosition.y = e.pageY
        })

        this.$path.addEventListener('mousedown', e => {

            this.isTouching = true

            this.getFinishPosition()

            this.oldPosition.x = e.pageX
            this.oldPosition.y = e.pageY
        })

        this.$path.addEventListener('mousemove', event => {

            if (!this.isTouching) return null

            this.moveElement(event)
        })

        this.$path.addEventListener('mouseup', () => {

            this.isTouching = false
        })


        // ouvre
        document.addEventListener("openPromise", this.openPromise.bind(this) )
    }

    setUpSlide() {

        anime.set(
            this.$thanks,
            {
                scale: 0
            }
        )
    }

    setUpAnimation() {

        const params = {
            container: this.$animationContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: '../assets/bodymoving/promise/data.json'
        }

        this.anim = lottie.loadAnimation(params)
    }

    getFinishPosition() {

        const left = this.$finish.getBoundingClientRect().left
        const top = this.$finish.getBoundingClientRect().top
        const width = this.$finish.getBoundingClientRect().width
        const height = this.$finish.getBoundingClientRect().height

        this.finishPosition = {
            xMin: left,
            xMax: left + width,
            yMin: top,
            yMax: top + height
        }
    }

    moveElement(event) {

        const x = event.pageX
        const y = event.pageY

        this.detecPosition(x, y)
        this.dragElement(x, y)
        this.playVideo(x)
    }

    dragElement(x, y) {

        const tx = x - this.oldPosition.x
        const ty = y - this.oldPosition.y

        anime.set(
            this.$dot,
            {
                translateY: '+=' + ty,
                translateX: '+=' + tx,
            }
        )

        this.oldPosition = {
            x: x,
            y: y
        }
    }

    detecPosition(x, y) {

        const marge = 20

        // si sur bouche
        const insideFinishX = x > this.finishPosition.xMin - marge && x < this.finishPosition.xMax + marge
        const insideFinishY = y > this.finishPosition.yMin - marge && y < this.finishPosition.yMax + marge

        if (insideFinishX && insideFinishY) this.stopPromise()
    }

    playVideo(x) {

        const percent = Math.trunc((x * 100) / this.ww)

        this.anim.goToAndStop(percent, true)
    }

    stopPromise()  {

        this.isTouching = false

        // aniamation
        const timeline = anime.timeline({
            complete: () => {

                // change le bouton
                this.$openPromise.classList.add('p-home__open-promise--done')
                this.$openPromise.querySelector('.a-button__fill').setAttribute('src', '../assets/img/button-disabled.svg')

                // Reviens bilan
                this.$container.classList.remove('p-home-promise--active')

                // affiche activité
                document.dispatchEvent(new CustomEvent("openResults"))
            }
        })

        timeline
            .add({
                targets: this.$dot,
                easing: 'easeOutElastic(1, .6)',
                scale: 0,
                duration: 500,
            }, 0)
            .add({
                targets: this.$title,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 0,
                translateY: 20,
                duration: 500,
            }, 0)
            .add({
                targets: this.$path,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 0,
                duration: 500,
            }, 0)
            .add({
                targets: this.$thanks,
                scale: 1,
                duration: 500,
                easing: 'easeOutElastic(1, .6)',
            })
    }

    openPromise () {

        // ferme resultats
        document.dispatchEvent(new CustomEvent("closeResults"))

        // affiche promise
        this.$container.classList.add('p-home-promise--active')
    }
}