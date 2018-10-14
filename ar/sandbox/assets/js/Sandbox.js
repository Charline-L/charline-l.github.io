class Sandboxe {
    constructor(infos) {
        const t = this

        // le marker
        t.pattern = infos.pattern
        t.id = infos.id

        // DOM
        t.$container = document.querySelector(".sandboxe-game__canvas")
        t.$header = document.querySelector(".sandboxe-game__header")
        t.$buttonEdit = document.querySelector(".sandboxe-game__button--edit")
        t.$buttonDelete = document.querySelector(".sandboxe-game__button--delete")
        t.$buttonAdd = document.querySelector(".sandboxe-game__button--add")
        t.$colors = document.querySelector(".sandboxe-game__colors")
        t.$colorSlideChroma = document.querySelector(".sandboxe-game__slide-chroma")
        t.$colorResult = document.querySelector(".sandboxe-game__result")

        // variable urls
        THREEx.ArToolkitContext.baseURL = './assets/markers/'

        // taille de l'écran
        t.ww = window.innerWidth
        t.wh = window.innerWidth

        // loop des functions
        t.onRenderFcts = []

        // scene
        t.scene = new THREE.Scene()

        // flag
        t.isSeen = false
        window.isEdition = false

        t.init()
    }

    init() {
        const t = this

        t.createRenderer()
        t.createCamera()
        t.createArToolKitSource()

        t.bindEvents()

        t.initArToolKitSource()
        t.initMarker()
        t.initDetectMarker()
        t.initRenderer()

        t.animationFrame()
    }

    createRenderer() {
        const t = this

        // création éléments
        t.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        })

        // lui ajoute les propriétés
        t.renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        t.renderer.setSize(t.ww, t.wh)
        t.renderer.domElement.classList.add("sandboxe-game__canvas")

        // ajoute au dom
        document.body.insertBefore(t.renderer.domElement, t.$header)
    }

    createCamera() {
        const t = this

        t.camera = new THREE.PerspectiveCamera(75, t.ww / t.wh, 0.1, 1000)
        t.scene.add(t.camera)
    }

    createArToolKitSource() {
        const t = this

        t.arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        })

        t.arToolkitSource.init(function onReady() {
            t.resize()
        })
    }

    bindEvents() {
        const t = this

        document.addEventListener("resize", t.resize.bind(t))

        // permet d'intéragir avec le DOM >>> est envoyé dans la class Cube
        t.domEvents = new THREEx.DomEvents(t.camera, t.renderer.domElement)

        // Change color
        // TODO === on le met dans le cube ?
        t.$colorSlideChroma.addEventListener("change", t.updateCubeColor.bind(t))

        // Edit button
        t.$buttonEdit.addEventListener("click", t.editMode.bind(t))
        t.$buttonAdd.addEventListener("click", t.addMode.bind(t))
        // TODO === à remettre
        // t.$buttonDelete.addEventListener("click", t.removeCube.bind(t))

        // Watcher évènements lancés depuis les classes Cubes
        window.addEventListener("hideButtonDelete", t.hideButtonDelete.bind(t))
        window.addEventListener("showButtonDelete", t.showButtonDelete.bind(t))
    }

    resize() {
        const t = this

        // recalcule les valeurs de notre écran
        t.ww = window.innerWidth
        t.wh = window.innerHeight

        // gestion arToolKit
        t.arToolkitSource.onResizeElement()
        t.arToolkitSource.copyElementSizeTo(t.renderer.domElement)
        if (t.arToolkitContext.arController !== null) {
            t.arToolkitSource.copyElementSizeTo(t.arToolkitContext.arController.canvas)
        }
    }

    initArToolKitSource() {
        const t = this

        // créer un context
        t.arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'camera_para.dat',
            detectionMode: 'mono',
        })

        // lance init
        t.arToolkitContext.init(function onCompleted() {
            t.camera.projectionMatrix.copy(t.arToolkitContext.getProjectionMatrix())
        })

        // ajoute la fonction au tableau qui stocke les fonctions pour le loop
        t.onRenderFcts.push(() => {
            if (t.arToolkitSource.ready === false) return
            t.arToolkitContext.update(t.arToolkitSource.domElement)
        })
    }

    initMarker() {
        const t = this

        // création d'un groupe d'éléments
        let grid = new THREE.Group()

        // donne un nom au groupe pour le récupérer dans la scene
        grid.name = 'grid'

        // ajoute à la scene
        t.scene.add(grid)

        // ajoute le marker que l'on doit "voir" à notre grille
        new THREEx.ArMarkerControls(t.arToolkitContext, grid, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + t.pattern,
        })
    }

    initDetectMarker() {
        const t = this

        let grid = t.scene.getObjectByName('grid')

        t.onRenderFcts.push(() => {

            if (grid.visible && !t.isSeen) t.getCubes()
        })
    }

    initRenderer() {
        const t = this

        // ajoute renderer au tableau d'update
        t.onRenderFcts.push(() => {
            t.renderer.render(t.scene, t.camera)
        })
    }

    animationFrame() {
        const t = this

        requestAnimationFrame(function animate(nowMsec) {

            // lance la boucle
            requestAnimationFrame(animate)

            // measure time
            t.lastTimeMsec = t.lastTimeMsec || nowMsec - 1000 / 60
            let deltaMsec = Math.min(200, nowMsec - t.lastTimeMsec)
            t.lastTimeMsec = nowMsec

            // appelle les function d'update que l'on vait stocké dans un tableau
            t.onRenderFcts.forEach((onRenderFct) => {
                onRenderFct(deltaMsec / 1000, nowMsec / 1000)
            })
        })
    }

    getCubes() {
        const t = this

        // met le flag à true pour en pas repasser dans la fonction
        t.isSeen = true

        // appelle le serveur pour récupérer les cubes associées au marker
        let cubesRegistered = [
            {
                position: {
                    x: 1,
                    y: 0,
                    z: 1
                },
                color: 0xff0000,
                alpha: 0.5,
                wireframe: false,
                _id: 123456,
            },
            {
                position: {
                    x: 2,
                    y: 0,
                    z: 2
                },
                color: 0x00ff00,
                alpha: 1,
                wireframe: false,
                _id: 123456,
            },
            {
                position: {
                    x: 1,
                    y: 0,
                    z: 0
                },
                color: 0x0000ff,
                alpha: 1,
                wireframe: false,
                _id: 123456,
            },
            {
                position: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                color: 0x00ffff,
                alpha: 1,
                wireframe: false,
                _id: 123456,
            }
        ]

        for (let cubeRegister of cubesRegistered) new Cube(cubeRegister, t.scene, t.domEvents)
    }

    updateCubeColor() {
        const t = this

        t.cubeColor = t.hslToHex(t.$colorSlideChroma.value, 100, 50);
        t.$colorResult.style.backgroundColor = 'hsl(' + t.$colorSlideChroma.value + ', 100%, 50%)'

        // Loop sur les éléments Mesh
        t.scene.traverse(function (node) {

            if (node instanceof THREE.Mesh) {
                // Si le cube est sélectionné
                if (node.active) {
                    // Changement de couleur
                    let material = new THREE.MeshBasicMaterial({color: t.cubeColor})
                    node.material = material
                    t.cubeInactive(node.name)
                }
            }
        })
    }

    editMode() {
        const t = this

        // si active on revient au mode vue
        if (t.$buttonEdit.classList.contains('active')) {

            // changement des boutons
            t.$colors.classList.add('hidden')
            t.$buttonAdd.classList.remove('hidden')

            // Mode edition à false -> dé-autoriser le click sur la grille
            window.isEdition = false
        } else {

            // trigger change pour setter la couleur dans le result
            t.$colorSlideChroma.dispatchEvent(new Event('change'))

            // changement des boutons
            t.$colors.classList.remove('hidden')
            t.$buttonAdd.classList.add('hidden')

            // Mode edition à true -> autoriser le click sur la grille
            window.isEdition = true
        }

        // met à jour la class
        t.$buttonEdit.classList.toggle('active')
    }

    addMode() {
        const t = this

        // si active on revient au mode vue
        if (t.$buttonAdd.classList.contains('active')) {

            // changement des boutons
            t.$colors.classList.add('hidden')
            t.$buttonEdit.classList.remove('hidden')
        } else {

            // trigger change pour setter la couleur dans le result
            t.$colorSlideChroma.dispatchEvent(new Event('change'))

            // changement des boutons
            t.$colors.classList.remove('hidden')
            t.$buttonEdit.classList.add('hidden')
        }

        // met à jour la class
        t.$buttonAdd.classList.toggle('active')
    }

    removeCube() {
        const t = this

        // Loop sur les éléments Mesh
        t.scene.traverse(function (node) {

            if (node instanceof THREE.Mesh) {
                // Si le cube est sélectionné
                if (node.active) {
                    // Couleur transparentes sur le cube
                    let material = new THREE.MeshBasicMaterial({color: "#ffffff", wireframe: true})
                    node.material = material
                    t.cubeInactive(node.name)
                }
            }
        })

        // enlève le boutton delete
        t.hideButtonDelete()
    }

    hideButtonDelete() {
        const t = this

        console.log("in hideButtonDelete")

        t.$buttonDelete.classList.add('hidden')
    }

    showButtonDelete() {
        const t = this

        console.log("in showButtonDelete ")

        t.$buttonDelete.classList.remove('hidden')
    }

    hslToHex(h, s, l) {
        h /= 360
        s /= 100
        l /= 100
        let r, g, b
        if (s === 0) {
            r = g = b = l // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1
                if (t > 1) t -= 1
                if (t < 1 / 6) return p + (q - p) * 6 * t
                if (t < 1 / 2) return q
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
                return p
            }
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s
            const p = 2 * l - q
            r = hue2rgb(p, q, h + 1 / 3)
            g = hue2rgb(p, q, h)
            b = hue2rgb(p, q, h - 1 / 3)
        }
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
}