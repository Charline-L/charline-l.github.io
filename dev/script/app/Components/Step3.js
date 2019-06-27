class Step3 {

    constructor(props) {

        this.$container = props.$container
        this.$containerFood = this.$container.querySelector('.p-step-three__container-food')
        this.$overlay = this.$container.querySelector('.p-step-three__overlay')
        this.$mouth = this.$container.querySelector('.p-step-three__mouth')

        this.$foodDragging = null
        this.isDragging = false
        this.oldPosition = {
            x: null,
            y: null
        }

        this.init()
    }

    init() {

        this.getMouthPosition()
        this.start()
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

        // TODO : changer pour récupérerles vrais envoyés
        localStorage.setItem('food-detected', JSON.stringify(['riz', 'banane', 'fromage', 'viande']))

        // récupère éléments
        const food = JSON.parse(localStorage.getItem('food-detected'))

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

        // click + présicion
        this.$foodSelect.forEach($foodSelect => {

            $foodSelect.addEventListener('click', () => {

                console.log('click')
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

        // TODO : drag mobile
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
    }

    startDragging(e, $food) {

        // pas si besoin précision
        const isSelected = $food.classList.contains('p-step-three__food--select')
        if (isSelected) return null

        this.isDragging = true
        this.$foodDragging = $food

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
}