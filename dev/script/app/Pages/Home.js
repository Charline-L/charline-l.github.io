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