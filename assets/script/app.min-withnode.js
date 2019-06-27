class Accounts {

    constructor() {

        this.$list = document.querySelector('.p-account__list')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.getAccounts()
    }

    getAccounts() {

        new XHR({
            method: 'GET',
            url: 'child/accounts',
            success: this.successGetAccounts.bind(this),
            error: this.errorGetAccounts.bind(this),
            data: null
        })
    }

    successGetAccounts(data) {
        const children = JSON.parse(data)

        // ajoute les enfants le DOM
        for(let i = 0; i< children.length; i++) this.appendAccount(children[i])

        // stocke les comptes
        this.$accounts = document.querySelectorAll('.p-account__item')

        // lance écouter d'events
        this.bindEvents()
    }

    appendAccount(infos) {

        const isActive = infos.color !== null

        const li = document.createElement('li')
        li.classList.add('p-account__item')

        const p = document.createElement('p')
        p.classList.add('p-account__name')
        p.innerText = infos.name

        const img = document.createElement('img')
        img.classList.add('p-account__avatar')
        img.src = isActive ? '../assets/img/avatar/'+infos.color+'.svg' : '../assets/img/avatar/default.png'

        li.appendChild(img)
        li.appendChild(p)

        li.setAttribute('data-active', isActive)
        li.setAttribute('data-id', infos._id)
        li.setAttribute('data-name', infos.name)

        this.$list.appendChild(li)
    }

    errorGetAccounts(error) {

        console.log('Erreur pendant la récupération des comptes', error)
    }

    bindEvents() {

        this.$accounts.forEach($account => {

            $account.addEventListener('click', () => {
                const isActive = $account.getAttribute('data-active')

                if (isActive) this.selectAccount($account.getAttribute('data-id'), $account.getAttribute('data-name'))
                else document.location.href = '/pages/register-child'
            })
        })
    }

    selectAccount(id, name) {

        localStorage.setItem('child-name', name)
        localStorage.setItem('child-id', id)

        document.location.href = '/pages/home'
    }
}
class Custom {

    constructor() {

        this.$container = document.querySelector('.p-custom__container')
        this.$image = document.querySelector('.p-custom__image')
        this.$genders = document.querySelectorAll('.p-custom__item')
        this.$validate = document.querySelector('.p-custom__validate')
        this.$audios = document.querySelectorAll('.p-custom__audio')
        this.currentSelected = null

        this.init()
    }

    async init() {

        await new NeedToken()
        this.updateSelection(0)
        this.setUpHammer()
        this.bindEvents()
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$container)
    }

    updateSelection(index) {

        // enlève sélection du précédent
        if (this.currentSelected !== null ) this.$genders[this.currentSelected].classList.remove('p-custom__item--active')

        // nouvelle sélection
        this.$genders[index].classList.add('p-custom__item--active')
        this.$image.setAttribute('src', this.$genders[index].querySelector('img').getAttribute('src'))
        this.currentSelected = index

        // lance audio
        this.$audios[index].play()
    }

    bindEvents() {

        // swipe
        this.hammer.on('swipeleft', () => {

            if (this.currentSelected === 0) this.updateSelection(1)
        })

        this.hammer.on('swiperight', () => {

            if (this.currentSelected === 1) this.updateSelection(0)
        })

        // click
        this.$genders.forEach($gender => {

            $gender.addEventListener('click', () => {

                const isActive = $gender.classList.contains('p-custom__item--active')

                if (!isActive) this.updateSelection(Array.from(this.$genders).indexOf($gender))
            })
        })


        // valide
        this.$validate.addEventListener('click', this.validate.bind(this))
    }

    validate() {

        new XHR({
            method: 'POST',
            url: 'child/save-avatar',
            success: this.successValidate.bind(this),
            error: this.errorValidate.bind(this),
            data:
                encodeURIComponent('avatar') +
                "=" +
                encodeURIComponent(this.$genders[this.currentSelected].getAttribute('data-gender')) +
                "&" +
                encodeURIComponent('id') +
                "=" +
                encodeURIComponent(localStorage.getItem('child-id'))
        })
    }

    successValidate() {

        document.location = '/pages/home'
    }

    errorValidate(error) {

        console.log("error", error)
    }
}
class Home {

    constructor() {

        this.$slideshow = document.querySelectorAll('.c-slideshow')
        this.$illustration = document.querySelector('.p-home-activity__illustration')
        this.$promise = document.querySelector('.p-home-promise')

        this.init()
    }

    async init() {

        await new NeedToken()

        new Logout()

        new Results()

        this.$slideshow.forEach($slideshow => {
            new Slideshow({$container: $slideshow})
        })

        new Illustration({$container: this.$illustration})

        new AddMeal()

        new Promise({$container: this.$promise})
    }
}
class Index {

    constructor() {

        this.init()
    }

    async init(){

        await new NeedToken()
        Index.redirect()
    }

    static redirect() {

        document.location.href = localStorage.getItem('connected') === 'true' ? '/pages/home' : '/pages/login'
    }
}
class Login {

    constructor() {

        this.$form = document.querySelector('#loginForm')

        this.init()
    }


    init() {

        this.bindEvents()
    }

    bindEvents() {

        // submit form
        this.$form.addEventListener('submit', this.checkBeforeSubmit.bind(this))
    }

    checkBeforeSubmit(e) {

        // prevent default
        e.preventDefault()

        // récupère nos données
        const data = serialize(this.$form)

        // créer la requete
        new XHR({
            method: 'POST',
            url: 'auth/login',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: data
        })
    }

    success() {

        document.location.href = '/pages/accounts'
    }

    error(error) {
        console.log('error', error)
    }
}
class Logout {

    constructor() {

        this.$logout = document.getElementById('logout')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

        this.$logout.addEventListener('click', this.logout.bind(this))
    }

    logout() {

        new XHR({
            method: 'GET',
            url: 'auth/logout',
            success: this.successLougout.bind(this),
            error: this.errorLogout.bind(this),
            data: null
        })
    }

    successLougout() {

        localStorage.removeItem('connected')
        localStorage.removeItem('child-name')
        localStorage.removeItem('child-id')

        // renvoi vers connexion
        document.location.href = '/'
    }

    errorLogout() {

        console.log('erreur pendant la déconnexion')
    }
}
class Register {

    constructor() {

        this.$form = document.querySelector('#registerForm')

        this.init()
    }

    init() {

        this.bindEvents()
    }

    bindEvents() {

        // submit form
        this.$form.addEventListener('submit', this.checkBeforeSubmit.bind(this))
    }

    checkBeforeSubmit(e) {

        // prevent default
        e.preventDefault()

        // récupère nos données
        const data = serialize(this.$form)

        // créer la requete
        new Request({
            method: 'POST',
            url: 'auth/register',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: data
        })
    }

    success() {

        document.location.href = '/pages/register-child'
    }

    error(error) {
        console.log('error', error)
    }
}
class AddMeal {

    constructor() {

        this.$daysToAdd = document.querySelector('.js-day-to-add')
        this.$container = document.querySelector('.p-home__add-meal')
        this.$steps = document.querySelectorAll('.p-home-step')
        this.$top = document.querySelector('.p-home-top')
        this.$mood = document.querySelector('.p-home-progress__current')
        this.$progressFill = document.querySelector('.p-home-progress__fill')

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
            this.$audio.play()
        })

        // fin audio
        this.$audio.addEventListener("ended", () => {
            this.anim.play()
        })
    }
}
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

        console.log('in getFinishPosition', this.finishPosition)

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

                // TODO : changé le bouton de promise et pas de click à détecter

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

        // calcul position
        this.getFinishPosition()
    }
}
class Results {

    constructor() {

        this.$results = document.querySelector('.p-home-results')
        this.$ilustration = document.querySelector('.p-home-activity__container-illustration')
        this.$container = document.querySelector('.p-home-activity')
        this.$swipe = document.querySelector('.p-home-results__swipe')
        this.$top = document.querySelector('.p-home-activity__top')

        this.$iconBottom = document.querySelector('.js-poda-icon')
        this.$animates = document.querySelectorAll('.js-animate-top')

        this.$page = document.querySelector('.p-home')
        this.$openPromise = document.querySelector('.p-home__open-promise')

        console.log('this.$openPromise', this.$openPromise)

        this.areResultsOpen = false

        this.init()
    }

    async init() {

        Results.updateStorage('false')
        this.setUpCSS()
        this.setUpHammer()
        this.bindEvents()
    }

    static updateStorage(value) {

        localStorage.setItem('results', value)
    }

    setUpCSS() {

        // taille middle
        this.resultH = this.$results.clientHeight
        this.topH = this.$top.clientHeight

        const containerH = this.$container.clientHeight

        this.$ilustration.style.height = containerH - this.resultH - this.topH + 'px'

        // récupère la taille du swipe
        this.swipeH = this.$swipe.clientHeight

        // set la taille du container
        anime.set(
            this.$results,
            {
                height: this.resultH
            }
        )
    }

    setUpHammer() {

        this.hammer = new Hammer(this.$results)
        this.hammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL })
    }

    bindEvents() {

        // swipe
        this.hammer.on('swipeup', () => {

            if (this.areResultsOpen) return null
            else this.openResults()
        })

        this.hammer.on('swipedown', () => {

            if (!this.areResultsOpen) return null
            else this.closeResults()
        })

        // ouvre promise
        this.$openPromise.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent("openPromise"))
        })

        // ouvre
        document.addEventListener("openResults", this.openResults.bind(this) )

        // ferme
        document.addEventListener("closeResults", this.closeResults.bind(this) )
    }

    openResults() {
        const hasResults = localStorage.getItem('results') === 'true'

        if (hasResults) this.openResultsBig()
        else this.openResultsSmall()
    }

    openResultsBig() {

        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        this.$results.classList.add('p-home-results--complete')
        this.$results.classList.remove('p-home-results--small')

        // récupère la taille du swipe
        const oldH = this.swipeH
        this.$swipe.style.height = 'auto'
        this.swipeH = this.$swipe.clientHeight + 100
        this.$swipe.style.height = oldH + 'px'

        const pageH = this.$page.clientHeight

        this.differenceTodAdd = this.swipeH - pageH * 0.25

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = true
                document.dispatchEvent(new CustomEvent("resizeSlideshow"))
            }
        })

        // animation
        timeline
            .add({
                targets: this.$page,
                height: '+=' + this.differenceTodAdd,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)
            .add({
                targets: this.$results,
                height: this.resultH + this.swipeH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, '-=250')
    }

    openResultsSmall() {

        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        anime.set(
            this.$iconBottom,
            { scale: 0 }
        )

        this.$iconBottom.style.display = 'block'
        this.$results.classList.add('p-home-results--waiting')

        // récupère la taille du swipe
        const oldH = this.swipeH
        this.$swipe.style.height = 'auto'
        this.swipeH = this.$swipe.clientHeight
        this.$swipe.style.height = oldH + 'px'

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = true
            }
        })

        // animation
        timeline
            .add({
                targets: this.$results,
                height: this.resultH + this.swipeH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            })
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, '-=250')
            .add({
                targets: this.$iconBottom,
                scale: 1,
                easing: 'easeOutElastic(1, .6)',
                duration: 500,
            }, '-=250')
    }

    closeResults() {

        if (localStorage.getItem('results') === 'false') this.closeResultsSmall()
        else this.closeResultsBig()
    }

    closeResultsBig() {

        const scopeHome = this

        this.$results.classList.add('p-home-results--small')
        this.$results.classList.remove('p-home-results--complete')
        this.$results.classList.remove('p-home-results--waiting')

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false
            }
        })

        // animation
        timeline
            .add({
                targets: this.$results,
                height: this.resultH,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
            }, 0)
            .add({
                targets: this.$page,
                height: '-=' + this.differenceTodAdd,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
            }, 0)
    }

    closeResultsSmall() {

        const scopeHome = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false

                this.$results.classList.add('p-home-results--small')
                this.$results.classList.remove('p-home-results--complete')
                this.$results.classList.remove('p-home-results--waiting')
            }
        })

        // animation
        timeline
            .add({
                targets: this.$animates,
                opacity: 1,
                translateY: 0,
                easing: 'cubicBezier(.5, .05, .1, .3)',
                duration: 250,
                delay: anime.stagger(100)
            }, 0)
            .add({
                targets: this.$results,
                height: this.resultH,
                easing: 'easeOutElastic(1, .6)',
                duration: 750,
            }, 0)
            .add({
                targets: this.$iconBottom,
                scale: 0,
                easing: 'easeOutElastic(1, .6)',
                duration: 250,
            }, 0)
    }
}
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
class Step1 {
    constructor(props) {

        this.$container = props.$container
        this.$titles = this.$container.querySelectorAll('.p-step-one__text')
        this.$audios = this.$container.querySelectorAll('.p-step-one__audio')
        this.$next = this.$container.querySelector('.p-step-one__next')
        this.$containerMouth = this.$container.querySelector('.p-step-one__mouth-animation')


        this.isAnimating = false
        this.currentIndex = 0

        this.numberSlides = this.$titles.length

        this.init()
    }

    init() {

        this.setUpTexts()
        this.setUpArrow()
        this.setupMouthAnimation()
        this.bindEvents()
    }

    setUpTexts() {

        anime.set(
            this.$titles,
            {
                opacity: 0,
                translateY: 20
            }
        )
    }

    setUpArrow() {

        anime.set(
            this.$next,
            {
                scale: 0
            }
        )
    }

    bindEvents() {

        // flèche
        this.$next.addEventListener('click', () => {

            if (this.isAnimating) return null
            else if (this.currentIndex === this.numberSlides) this.nextStep()
            else this.nextText()
        })

        // audio fin
        this.$audios.forEach($audio => {
            $audio.addEventListener('ended', this.soundEnded.bind(this))
        })
    }

    start() {

        this.nextText()
    }

    nextText() {

        const scopeStep = this
        this.isAnimating = true

        const timeline = anime.timeline({
            duration: 500,
            complete: () => {

                this.$audios[scopeStep.currentIndex].play()
                this.currentIndex++
                this.isAnimating = false
            }
        })

        if (this.currentIndex !== 0) {

            timeline
                .add({
                    targets: this.$titles[this.currentIndex - 1],
                    easing: 'cubicBezier(.5, .05, .1, .3)',
                    opacity: 0,
                    translateY: -20
                })
        }

        timeline
            .add({
                targets: this.$titles[this.currentIndex],
                easing: 'cubicBezier(.5, .05, .1, .3)',
                opacity: 1,
                translateY: 0,
            }, '-=250')
            .add({
                targets: this.$next,
                scale: 0,
                duration: 250,
            }, 0)
    }

    setupMouthAnimation() {

        // const params = {
        //     container: this.$container.querySelector('.p-home-step__mouth-animation'),
        //     renderer: 'svg',
        //     loop: true,
        //     autoplay: true,
        //     path: '../assets/bodymoving/mouth/speak.json'
        // }
        //
        // this.mouthAnim = lottie.loadAnimation(params)
        //
        // this.mouthAnim.pause()
    }

    soundEnded() {

        // TODO : pause animation de la bouche
        // this.mouthAnim.pause()

        anime({
            targets: this.$next,
            scale: 1,
        })
    }

    nextStep() {

        document.dispatchEvent(new CustomEvent("nextStep"))
    }
}
window.MediaRecorder = require('audio-recorder-polyfill')

class Step2 {

    constructor(props) {

        this.$container = props.$container
        this.$instructions = this.$container.querySelectorAll('.p-step-two__instruction')
        this.$buttons = this.$container.querySelectorAll('.p-step-two__button')
        this.$heads = this.$container.querySelectorAll('.p-step-two__head')
        this.$rights = this.$container.querySelectorAll('.p-step-two__right')
        this.$lefts = this.$container.querySelectorAll('.p-step-two__left')

        this.$containerIllu = this.$container.querySelector('.p-step-two__poda')

        this.buttonsOrigins = []
        this.currentIndex = 0

        this.$player = this.$container.querySelector('.p-step-two__audio')

        this.init()
    }

    init() {

        this.reset()
        // this.getValues()
        this.setUpSlides()
        this.bindEvents()
    }

    start() {

        this.setUpRecorder()
        this.updateStep()
    }

    reset(){

        localStorage.removeItem('food-detected')
    }

    setUpRecorder() {

        const scopeStep = this

        const constraints = {
            audio: {
                sampleRate: 48000,
                channelCount: 1,
                volume: 1.0,
                echoCancellation: true,
                autoGainControl: true
            },
            video: false
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {

                scopeStep.mediaRecorder = new MediaRecorder(stream)

                scopeStep.chunks = []

                // passe l'audio dans le player
                scopeStep.mediaRecorder.addEventListener('dataavailable', e => {
                    scopeStep.chunks.push(e.data)
                    scopeStep.$player.src = URL.createObjectURL(e.data)
                    scopeStep.sendBlob()
                })
            })
            .catch(() => {
                alert('pas de media')
            })

    }

    // getValues() {
    //
    //     const topContainer = this.$containerIllu.getBoundingClientRect().top
    //     const leftContainer = this.$containerIllu.getBoundingClientRect().left
    //
    //     this.$buttons.forEach( $button => {
    //
    //         const buttonW = $button.getBoundingClientRect().width
    //         const buttonH = $button.getBoundingClientRect().height
    //
    //         const centerX = $button.getBoundingClientRect().left + buttonW / 2 - leftContainer
    //         const centerY = $button.getBoundingClientRect().top + buttonH / 2 - topContainer
    //         const origin = centerX + "px " + centerY + "px 0"
    //
    //         this.buttonsOrigins.push(origin)
    //     })
    // }

    setUpSlides() {

        // instructions
        anime.set(
            this.$instructions,
            {
                opacity: 0,
                translateY: 20
            }
        )

        // icone
        anime.set(
            this.$buttons,
            {
                opacity: 0
            }
        )

        // tete
        anime.set(
            this.$heads[1],
            {
                opacity: 0,
            }
        )

        // main
        anime.set(
            this.$lefts[1],
            {
                opacity: 0,
            }
        )

        anime.set(
            this.$rights[1],
            {
                opacity: 0,
            }
        )
    }

    bindEvents() {

        // click micro
        this.$buttons.forEach($button => {

            $button.addEventListener('click', () => {

                const isStart = $button.classList.contains('p-step-two__button--start')

                if (isStart) this.startRecording()
                else this.stopRecording()
            })
        })
    }

    startRecording() {

        // vide données
        this.chunks = []

        // lance audio
        this.mediaRecorder.start()

        // stop par défaut dans 5s
        this.timerMaxRecording = setTimeout(() => {
            this.stopRecording()
        }, 60000)

        // animation
        this.updateStep()
    }

    stopRecording() {

        // enlève timer
        clearTimeout(this.timerMaxRecording)

        // arrete enregistrement
        this.mediaRecorder.stop()

        // enlève le micro
        anime({
            targets: this.$buttons[this.currentIndex - 1],
            opacity: 0,
        })

        // remet tete bonhomme normal
        anime.set(
            this.$heads[1],
            {
                opacity: 0,
            }
        )

        // remet bras
        anime.set(
            this.$rights[1],
            {opacity: 0}
        )
        anime.set(
            this.$rights[0],
            {opacity: 1}
        )
    }

    sendBlob() {

        this.success(['riz', 'viande', 'banane', 'fromage'])

        // PASSE EN DIRECT
        // // prépare enregistrement
        // let formData = new FormData()
        // formData.append('audio', new Blob(this.chunks))
        //
        // // envoit au server
        // new XHR({
        //     method: 'POST',
        //     url: 'child/detect-food',
        //     success: this.success.bind(this),
        //     error: this.error.bind(this),
        //     data: formData,
        //     needsHeader: false
        // })
    }

    success(wordDetected) {

        // enregistre données
        localStorage.setItem('food-detected', JSON.stringify(wordDetected))

        // prochaine étape
        document.dispatchEvent(new CustomEvent("nextStep"))
    }

    error() {

        console.log('error')
    }

    updateStep() {

        const scopeStep = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                // tete
                anime.set(
                    this.$heads[this.currentIndex],
                    {
                        opacity: 0
                    }
                )

                // change tete
                anime.set(
                    scopeStep.$heads[this.currentIndex],
                    {
                        opacity: 1
                    }
                )

                scopeStep.currentIndex++
            }
        })

        // si slide précédente
        if (this.currentIndex !== 0) {

            anime.set(
                this.$lefts[1],
                {opacity: 0}
            )
            anime.set(
                this.$lefts[0],
                {opacity: 1}
            )

            anime.set(
                this.$rights[1],
                {opacity: 1}
            )
            anime.set(
                this.$rights[0],
                {opacity: 0}
            )

            timeline
                .add({
                    targets: this.$buttons[this.currentIndex - 1],
                    opacity: 0
                }, 0)
                .add({
                    targets: this.$instructions[this.currentIndex - 1],
                    opacity: 0,
                    translateY: -20
                }, 0)
        }
        else {

            anime.set(
                this.$lefts[1],
                {opacity: 1}
            )
            anime.set(
                this.$lefts[0],
                {opacity: 0}
            )
        }

        // animation
        timeline
            .add({
                targets: this.$buttons[this.currentIndex],
                opacity: 1,
            }, 0)
            .add({
                targets: this.$instructions[this.currentIndex],
                opacity: 1,
                translateY: 0
            }, 0)
    }
}
class Step3 {

    constructor(props) {

        this.$container = props.$container
        this.$containerFood = this.$container.querySelector('.p-step-three__container-food')
        this.$overlay = this.$container.querySelector('.p-step-three__overlay')
        this.$mouth = this.$container.querySelector('.p-step-three__mouth')
        this.$selection = this.$container.querySelector('.p-step-three__select')
        this.$foodToSelect = this.$container.querySelectorAll('.p-step-three__select-item')

        this.$bin = this.$container.querySelector('.p-step-three__button--delete')

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

    getBinPosition() {

        const left = this.$bin.getBoundingClientRect().left
        const top = this.$bin.getBoundingClientRect().top
        const width = this.$bin.getBoundingClientRect().width
        const height = this.$bin.getBoundingClientRect().height

        this.binPosition = {
            xMin: left,
            xMax: left + width,
            yMin: top,
            yMax: top + height
        }
    }

    start() {

        // position
        this.getMouthPosition()
        this.getBinPosition()

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

        // si sur poubelle
        const insideBinX = x > this.binPosition.xMin - marge && x < this.binPosition.xMax + marge
        const insideBinY = y > this.binPosition.yMin - marge && y < this.binPosition.yMax + marge


        if (insideMouthX && insideMouthY) this.eatFood()
        if (insideBinX && insideBinY) this.deleteFood()
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

    deleteFood() {

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
class NeedToken {

    constructor() {

        new XHR({
            method: 'GET',
            url: 'auth',
            success: this.success.bind(this),
            error: this.error.bind(this),
            data: null
        })
    }

    success() {

        localStorage.setItem('connected', 'true')
    }

    error() {

        localStorage.setItem('connected', 'false')

        // renvoi vers connexion
        document.location.href = '/pages/login'
    }
}
class XHR {

    constructor(props) {

        this.method = props.method
        this.url = props.url
        this.success = props.success
        this.error = props.error
        this.data = props.data
        this.needsHeader = props.needsHeader !== undefined ? props.needsHeader : true

        this.init()
    }

    init() {

        this.req = new XMLHttpRequest()

        const req = this.req
        const thisRegister = this

        this.req.onload = function () {

            if (req.status === 200) {

                const response = JSON.parse(this.responseText)

                if (response.status === "success") thisRegister.success(response.message)
                else thisRegister.error(response.message)
            }

            else {
                console.log("Status de la réponse: %d (%s)", this.status, this.statusText)
                thisRegister.error()
            }
        }

        this.req.withCredentials = true
        this.req.open(this.method, `https://192.168.1.75:3003/${this.url}`, true)
        // this.req.open(this.method, `https://10.30.21.24:3003/${this.url}`, true)

        // pas d'hearder lorsque l'on envoit un blob
        if (this.needsHeader) this.req.setRequestHeader("Content-type","application/x-www-form-urlencoded")

        this.req.send(this.data)
    }
}
class app {

    constructor() {

        this.init()
    }

    init() {

        this.detectPage()
    }

    detectPage() {

        const pageClass = document.getElementById('page').getAttribute('data-page')
        eval(`new ${pageClass}()`);
    }
}



new app()