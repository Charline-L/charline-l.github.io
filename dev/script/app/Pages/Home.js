class Home {

    constructor() {

        this.$slideshow = document.querySelectorAll('.c-slideshow')
        this.$illustration = document.querySelector('.p-home-activity__illustration')

        this.init()
    }

    async init() {

        // await new NeedToken()

        new Results()

        this.$slideshow.forEach($slideshow => {
            new Slideshow({$container: $slideshow})
        })

        new Illustration({$container: this.$illustration})

        new AddMeal()
    }
}