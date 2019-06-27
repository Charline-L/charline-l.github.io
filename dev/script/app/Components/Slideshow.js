class Slideshow {

    constructor(props) {

        this.$container = props.$container
        this.$slides = this.$container.querySelectorAll('.c-slideshow__card')
        this.$closes = this.$container.querySelectorAll('.c-slideshow__close')

        this.$slidesButton = this.$container.querySelectorAll('.c-slideshow__card--button')

        this.currentIndex = 0
        this.maxSlide = this.$slides.length
        this.isAnimating = false

        this.init()
    }

    init() {

        this.setUpCSS()
        this.setUpHammer()
        this.bindEvents()
    }

    setUpCSS(){

        console.log('in set up css')

        // taille container
        this.cardW = this.$slides[0].clientWidth
        const cardMargin = 10

        this.$container.style.width = (this.cardW * 2 + cardMargin) + 'px'

        // taille margin-left
        const ww = window.innerWidth
        this.$container.style.marginLeft = (ww - this.cardW) / 2 - cardMargin * 1.5 + 'px'
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$container)
    }

    resize() {

        this.$container.style.width = window.innerWidth * 3 + 'px'
        this.setUpCSS()
    }

    bindEvents() {

        // resize
        document.addEventListener('resizeSlideshow', this.resize.bind(this))

        // swipe
        this.hammer.on('swipeleft', () => {

            if (this.currentIndex === this.maxSlide || this.isAnimating) return null
            else this.slide(-1)
        })

        this.hammer.on('swiperight', () => {

            if (this.currentIndex === 0 || this.isAnimating) return null
            else this.slide(1)
        })

        // click image produit
        this.$slidesButton.forEach($slide => {

            $slide.addEventListener('click', () => {

                const isOpen = $slide.classList.contains('c-slideshow__card--open')
                if (!isOpen && !this.isAnimating) this.openSlide($slide)
            })
        })

        // ferme
        this.$closes.forEach($close => {

            $close.addEventListener('click', () => {

                const $slide = $close.closest('.c-slideshow__card')
                if (!this.isAnimating) this.closeSlide($slide)
            })
        })
    }

    slide (direction) {

        const scopeSlideshow = this

        // block
        this.isAnimating = true

        const nextIndex = this.currentIndex + (direction * -1)

        // décale le slideshow
        anime({
            targets: this.$container,
            translateX: direction * this.cardW * nextIndex,
            complete: () => {
                scopeSlideshow.isAnimating = false
                this.currentIndex = nextIndex
            }
        })
    }

    openSlide($slide) {

        this.isAnimating = true
        const scopeSlideshow = this

        const $photo = $slide.querySelector('.c-slideshow__photo')
        const $close = $slide.querySelector('.c-slideshow__close')

        // prépare animation
        anime.set(
            $photo,
            { opacity: 0 }
        )

        anime.set(
            $close,
            { scale: 0 }
        )

        $photo.style.display = 'block'

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 500,
            complete: function () {
                $slide.classList.add('c-slideshow__card--open')
                scopeSlideshow.isAnimating = false
            }
        })

        // animation
        timeline
            .add({
                targets: $photo,
                opacity: 1,
            })
            .add({
                targets: $close,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
            })
    }

    closeSlide($slide) {

        const scopeSlideshow = this
        const $photo = $slide.querySelector('.c-slideshow__photo')

        this.isAnimating = true

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 500,
            complete: function () {
                $slide.classList.remove('c-slideshow__card--open')
                scopeSlideshow.isAnimating = false
            }
        })

        // animation
        timeline
            .add({
                targets: $photo,
                opacity: 0,
            })

    }
}