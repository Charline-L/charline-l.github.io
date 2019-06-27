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

        // await new NeedToken()
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