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
        img.src = isActive ? 'assets/img/'+infos.color+'.png' : 'assets/img/default.png'

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

        console.log('in home')

        this.init()
    }

    async init() {

        await new NeedToken()
        this.bindEvents()
    }

    bindEvents() {

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