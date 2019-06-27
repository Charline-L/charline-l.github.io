class Step3 {

    constructor(props) {

        this.$container = props.$container
        this.$containerFood = this.$container.querySelector('.p-step-three__container-food')
        this.$overlay = this.$container.querySelector('.p-step-three__overlay')
        this.$mouth = this.$container.querySelector('.p-step-three__mouth')
        this.$selection = this.$container.querySelector('.p-step-three__select')
        this.$foodToSelect = this.$container.querySelectorAll('.p-step-three__select-item')

        this.$foodDragging = null
        this.isDragging = false
        this.oldPosition = {
            x: null,
            y: null
        }

        this.init()
    }

    init() {

        // TODO : à enelever pour mel
        // localStorage.setItem('food-detected', JSON.stringify(['riz', 'viande', 'fromage', 'banane']))
        // this.start()
    }

    getMouthPosition() {

        const left = this.$mouth.getBoundingClientRect().left
        const top = this.$mouth.getBoundingClientRect().top
        const width = this.$mouth.getBoundingClientRect().width
        const height = this.$mouth.getBoundingClientRect().height

        this.mouthPosition = {
            xMin: left,
            xMax: left + width,
            yMin: top,
            yMax: top + height
        }
    }

    start() {

        // position
        this.getMouthPosition()

        // ajoute aliments
        this.addFood()

        // écouteurs
        this.$foodSelect = this.$containerFood.querySelectorAll('.p-step-three__food--select')
        this.$food = this.$containerFood.querySelectorAll('.p-step-three__food')

        this.bindEvents()

        // animation pop
        this.showFood()
    }

    addFood() {

        // récupère éléments
        const food = JSON.parse(localStorage.getItem('food-detected'))
        this.numberFoodElements = food.length

        // ajoute dans le DOM
        for(let i = 0; i < food.length; i++) {

            const li = document.createElement('li')
            li.classList.add('p-step-three__food')

            if (food[i] === 'viande') li.classList.add('p-step-three__food--select')

            const img = document.createElement('img')

            // détecte la sélection
            if (food[i] === 'viande') img.setAttribute('src', '../assets/img/food/viande-select.svg')
            else img.setAttribute('src', '../assets/img/food/' + food[i] + '.svg')
            img.setAttribute('draggable', 'false')

            li.appendChild(img)
            this.$containerFood.appendChild(li)

            // cache pour animation
            anime.set(
                li,
                {
                    scale: 0,
                }
            )
        }
    }

    bindEvents() {

        // click ouvrir présicion
        this.$foodSelect.forEach($foodSelect => {

            $foodSelect.addEventListener('click', () => {

                this.$currentSelection = $foodSelect

                this.openSelection()
            })
        })

        // click choisir viande
        this.$foodToSelect.forEach($foodToSelect => {

            $foodToSelect.addEventListener('click', () => {

                this.selectFood($foodToSelect)
            })
        })

        // drag
        this.$food.forEach($food => {

            $food.addEventListener('mousedown', e => {

                this.startDragging(e, $food)
            })

            $food.addEventListener('touchstart', e => {

                this.startDragging(e, $food)
            })
        })

        this.$containerFood.addEventListener('mouseup', this.stopDragging.bind(this))
        this.$containerFood.addEventListener('touchend', this.stopDragging.bind(this))

        this.$containerFood.addEventListener('mousemove', e => {

            this.moveDragging(e)
        })

        this.$containerFood.addEventListener('touchmove', e => {

            this.moveDragging(e)
        })
    }

    moveElement(event) {

        const x = event.pageX
        const y = event.pageY

        this.detecPosition(x, y)
        this.dragElement(x, y)
    }

    detecPosition(x, y) {

        const marge = 20

        // si sur bouche
        const insideMouthX = x > this.mouthPosition.xMin - marge && x < this.mouthPosition.xMax + marge
        const insideMouthY = y > this.mouthPosition.yMin - marge && y < this.mouthPosition.yMax + marge

        if (insideMouthX && insideMouthY) this.eatFood()
    }

    eatFood() {

        // animation
        anime.set(
            this.$foodDragging,
            {
                scale: 0,
            }
        )

        // reset variables
        this.stopDragging()

        // si dernier
        this.numberFoodElements--

        if (this.numberFoodElements === 0) this.nextstep()
    }

    startDragging(e, $food) {

        // pas si besoin précision
        const isSelected = $food.classList.contains('p-step-three__food--select')
        if (isSelected) return null

        this.isDragging = true
        this.$foodDragging = $food

        // ajoute classe
        this.$food.forEach($food => {
            $food.classList.add('p-step-three__food--inactive')
        })
        this.$foodDragging.classList.remove('p-step-three__food--inactive')

        this.oldPosition.x = e.pageX
        this.oldPosition.y = e.pageY
    }

    moveDragging(e) {

        if (!this.isDragging) return null
        else this.moveElement(e)
    }

    stopDragging() {

        this.isDragging = false
        this.$foodDragging = null
        this.oldPosition = {
            x: null,
            y: null
        }

        this.$food.forEach($food => {
            $food.classList.remove('p-step-three__food--inactive')
        })
    }

    dragElement(x, y) {

        const tx = x - this.oldPosition.x
        const ty = y - this.oldPosition.y

        anime.set(
            this.$foodDragging,
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

    showFood() {

        anime({
            targets: this.$food,
            scale: 1,
            easing: 'easeOutElastic(1, .6)',
            duration: 1000,
            delay: anime.stagger(500),
            complete: () => {

                this.removeOverlay()
            }
        })
    }

    removeOverlay() {

        anime({
            targets: this.$overlay,
            opacity: 0,
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            delay: 250
        })
    }

    openSelection() {

        // prépare animation
        const $title = this.$selection.querySelectorAll('.p-step-three__title')
        const $other = this.$selection.querySelectorAll('.p-step-three__other')
        const $pops = this.$selection.querySelectorAll('.js-pop')

        anime.set(
            $title,
            {
                opacity: 0,
                translateY: 20
            }
        )

        anime.set(
            $other,
            {
                opacity: 0,
                translateY: 20
            }
        )

        anime.set(
            $pops,
            {
                scale: 0
            }
        )

        // affiche le fond
        this.$selection.classList.add('p-step-three__select--active')

        // aniamation
        const timeline = anime.timeline()

        timeline
            .add({
                targets: $title,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 1,
                duration: 250,
                translateY: 0,
            })
            .add({
                targets: $pops,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 1000,
                delay: anime.stagger(500),
            })
            .add({
                targets: $other,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 1,
                duration: 250,
                translateY: 0,
            })
    }

    selectFood($food) {

        // ajoute icone dans l'écran d'avant
        const url = $food.querySelector('img').getAttribute('src')
        this.$currentSelection.querySelector('img').setAttribute('src', url)
        this.$currentSelection.classList.remove('p-step-three__food--select')

        // prépare animation
        const $title = this.$selection.querySelectorAll('.p-step-three__title')
        const $other = this.$selection.querySelectorAll('.p-step-three__other')
        const $pops = this.$selection.querySelectorAll('.js-pop')

        // aniamation
        const timeline = anime.timeline({
            complete: () => {
                this.$selection.classList.remove('p-step-three__select--active')
            }
        })

        timeline
            .add({
                targets: $title,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 0,
                duration: 250,
                translateY: 20,
            }, 0)
            .add({
                targets: $pops,
                scale: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                // delay: anime.stagger(100),
            }, 500)
            .add({
                targets: $other,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 0,
                duration: 250,
                translateY: 20,
            }, 0)


        // TODO : faire poper écran en dessous ?


        // TODO : ajouter pour le bilan

    }

    nextstep() {

        document.dispatchEvent(new CustomEvent("nextStep"))
    }
}