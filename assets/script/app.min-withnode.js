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

        this.init()
    }

    async init() {

        await new NeedToken()

        new Results()

        this.$slideshow.forEach($slideshow => {
            new Slideshow({$container: $slideshow})
        })

        new Illustration({$container: this.$illustration})
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
class Meal {
    constructor() {

        console.log('in meal')
        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents(){


    }
}
class Profile {

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
class Results {

    constructor() {

        this.$results = document.querySelector('.p-home-results')
        this.$ilustration = document.querySelector('.p-home-activity__container-illustration')
        this.$container = document.querySelector('.p-home-activity')
        this.$swipe = document.querySelector('.p-home-results__swipe')
        this.$top = document.querySelector('.p-home-activity__top')

        this.$iconBottom = document.querySelector('.js-poda-icon')
        this.$animates = document.querySelectorAll('.js-animate-top')
        this.$daysToAdd = document.querySelectorAll('.js-day-to-add')

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

        // ajouter un repas
        this.$daysToAdd.forEach($day => {
            $day.addEventListener('click', () => {
                this.addDay($day.getAttribute('data-day'))
            })
        })
    }

    openResults() {
        const scopeHome = this

        // prépare animation
        anime.set(
            this.$animates,
            {
                opacity: 0,
                translateY: 10
            }
        )

        if (localStorage.getItem('results') === 'false') {
            anime.set(
                this.$iconBottom,
                { scale: 0 }
            )

            this.$iconBottom.style.display = 'block'
            this.$results.classList.add('p-home-results--waiting')
        }
        else {

            this.$results.classList.add('p-home-results--complete')
        }

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

        // si fermé pop petite icone en bas
        if (localStorage.getItem('results') === 'false') {

            timeline
                .add({
                    targets: this.$iconBottom,
                    scale: 1,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 500,
                }, '-=250')
        }
    }

    closeResults() {

        const scopeHome = this

        // prépare la timeline
        const timeline = anime.timeline({
            easing: 'cubicBezier(.5, .05, .1, .3)',
            duration: 250,
            complete: () => {
                scopeHome.areResultsOpen = false

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

        // si fermé pop petite icone en bas
        if (localStorage.getItem('results') === 'false') {

            timeline
                .add({
                    targets: this.$iconBottom,
                    scale: 0,
                    easing: 'easeOutElastic(1, .6)',
                    duration: 250,
                }, 0)
        }
    }

    addDay(day) {

        // enregistre le jour
        this.dayToAdd = day

        // affiche
        Results.updateStorage('true')
        this.openResults()
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

    bindEvents() {

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