class AddMeal {

    constructor() {

        this.$daysToAdd = document.querySelector('.js-day-to-add')
        this.$container = document.querySelector('.p-home__add-meal')
        this.$steps = document.querySelectorAll('.p-home-step')
        this.$top = document.querySelector('.p-home-top')
        this.$mood = document.querySelector('.p-home-progress__current')
        this.$progressFill = document.querySelector('.p-home-progress__fill')
        this.$containerIllustration = document.querySelector('.p-home-activity__container-illustration')

        this.currentStep = 0
        this.stepMax = this.$steps.length

        this.init()
    }

    init() {

        this.step1 = new Step1({$container : document.querySelector('.p-home-step--one')})
        this.step2 = new Step2({$container : document.querySelector('.p-home-step--two')})
        this.step3 = new Step3({$container : document.querySelector('.p-home-step--three')})

        this.bindEvents()
    }

    bindEvents() {

        // ajouter un repas
        this.$daysToAdd.addEventListener('click', () => {
            this.selectDay(this.$daysToAdd.getAttribute('data-day'))
        })

        // changement de step
        document.addEventListener("nextStep", this.nextStep.bind(this) )

        // TODO : retour accueil
    }

    selectDay(day) {

        // enregistre le jour
        this.dayToAdd = day

        // affiche container
        this.$container.classList.add('p-home__add-meal--active')

        // change le top
        this.$top.classList.remove('p-home-top--progress')
        this.$top.classList.add('p-home-top--back')

        // lance step
        this.showStep()
    }

    nextStep() {

        this.currentStep++
        if (this.currentStep === 3) this.showResults()
        else this.showStep()
    }

    showStep() {

        const isFirst = this.currentStep === 0

        let $currentStep
        let $currentPops
        let $currentFades

        if (!isFirst) {

            $currentStep = this.$steps[this.currentStep - 1]
            $currentPops = $currentStep.querySelectorAll('.js-pop')
            $currentFades = $currentStep.querySelectorAll('.js-fade')
        }

        const $nextStep = this.$steps[this.currentStep]
        const $nextFades = $nextStep.querySelectorAll('.js-fade')
        const $nextPops = $nextStep.querySelectorAll('.js-pop')

        // prépare animation
        anime.set(
            $nextPops,
            {
                scale: 0
            }
        )

        anime.set(
            $nextFades,
            {
                opacity: 0,
                translateY: 20
            }
        )

        // affiche la slide si besoin
        if (isFirst) $nextStep.classList.add('p-home-step--active')

        // lance animation
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {

                // lance préparation des écrans
                switch (this.currentStep) {
                    case 0 :
                        this.step1.start()
                        break;
                    case 1 :
                        this.step2.start()
                        break;
                    case 2 :
                        this.step3.start()
                        break;
                    case 3 :
                        this.showResults()
                    default :
                        console.log('no index')
                }
            }
        })

        // animation de départ
        if (!isFirst) {

            timeline
                .add({
                    targets: $currentPops,
                    scale: 1,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 500,
                    delay: anime.stagger(100)
                })
                .add({
                    targets: $currentFades,
                    opacity: 1,
                    translateY: 0,
                    easing: 'cubicBezier(.5, .05, .1, .3)',
                    delay: anime.stagger(100),
                    complete: () => {

                        $nextStep.classList.add('p-home-step--active')
                        $currentStep.classList.remove('p-home-step--active')
                    }
                }, '-=250')
        }

        // animation
        timeline
            .add({
                targets: $nextPops,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 500,
                delay: anime.stagger(100)
            })
            .add({
                targets: $nextFades,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                delay: anime.stagger(100)
            }, '-=250')
    }

    showResults() {

        // change image
        Results.updateStorage('true')
        this.$daysToAdd.classList.remove('js-day-to-add')

        // change PODa
        this.$containerIllustration.classList.add('p-home-activity__container-illustration--sad')

        // reset sélection repas
        this.$container.classList.remove('p-home__add-meal--active')
        this.$steps.forEach($step => {
            $step.classList.remove('p-home__add-meal--active')
        })

        // change humeur
        this.$mood.innerHTML = 45
        this.$progressFill.classList.add('p-home-progress__fill--bad')
        this.$progressFill.style.width = 45 + '%'

        // change le top
        this.$top.classList.add('p-home-top--progress')
        this.$top.classList.remove('p-home-top--back')

        // ouvre le bilan
        document.dispatchEvent(new CustomEvent("openResults"))
    }
}