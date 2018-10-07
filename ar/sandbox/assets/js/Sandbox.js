class Sandboxe {
    constructor() {
        const t = this

        // DOM
        t.$container = document.querySelector(".sandboxe-game__canvas")
        t.$colors = document.querySelector(".sandboxe-game__colors")

        // variable urls
        THREEx.ArToolkitContext.baseURL = './assets/markers/'

        // taille de l'écran
        t.ww = window.innerWidth
        t.wh = window.innerWidth

        // toutes les couleurs
        t.colors = {
            white: 0xffffff
        }

        // loop des functions
        t.onRenderFcts = []

        // scene
        t.scene = new THREE.Scene()

        // flag
        t.elementSelected = false

        // grille
        t.gridSize = 3

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

        // TODO === regarder les fonctionnalités du render
        // lui ajoute les propriétés
        t.renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        t.renderer.setSize(t.ww, t.wh)
        t.renderer.domElement.style.position = 'absolute'
        t.renderer.domElement.style.top = '0'
        t.renderer.domElement.style.left = '0'

        // ajoute au dom
        t.$container.appendChild(t.renderer.domElement)
    }

    createCamera() {
        const t = this

        // TODO === regarder si ne pas mettre camera perspective ?
        t.camera = new THREE.Camera()
        t.scene.add(t.camera)
    }

    createArToolKitSource() {
        const t = this

        t.arToolkitSource = new THREEx.ArToolkitSource({
            sourceType: 'webcam',
        })

        // TODO === vérifier si fonction est : trigger un resize à son initialisation ?
        t.arToolkitSource.init(function onReady() {
            t.resize()
        })
    }

    bindEvents() {
        const t = this

        document.addEventListener("resize", t.resize.bind(t))
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
            // TODO : à checker === copy projection matrix to camera
            t.camera.projectionMatrix.copy(t.arToolkitContext.getProjectionMatrix());
        })

        // TODO === garde le tableau ou tout das une fonction ?
        // ajoute la fonction au tableau qui stocke les fonctions pour le loop
        t.onRenderFcts.push(function () {
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

        // récupère le marker que l'on doit chercher
        let controls = new THREEx.ArMarkerControls(t.arToolkitContext, grid, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.hiro',
        })

        // création de la grille lui sera liée
        for (let i = 0; i < t.gridSize ; i++) {
            for (let j = 0; j < t.gridSize ; j++) {

                let geometry = new THREE.BoxGeometry(1, 1, 1)
                let material = new THREE.MeshBasicMaterial({color: t.colors.white, wireframe: true})
                let mesh = new THREE.Mesh(geometry, material)

                mesh.position.x = i + 1 - (t.gridSize / 2)
                mesh.position.z = j + 1 - (t.gridSize / 2)

                // ajoute à notre groupe
                grid.add(mesh)
            }
        }


        // alert("changement position")
        // // je recentre mon groupe
        // grid.position.x =
        // grid.position.z = - t.gridSize / 2

        // ajoute à la scene
        t.scene.add(grid)
    }

    initDetectMarker() {
        const t = this

        let grid = t.scene.getObjectByName('grid')

        t.onRenderFcts.push(function () {

            if ( t.elementSelected && grid.visible ) {
                t.$colors.classList.remove("hidden")
            }
            else {
                t.$colors.classList.add("hidden")
            }
        })
    }

    initRenderer() {
        const t = this

        // ajoute renderer au tableau d'update
        t.onRenderFcts.push(function () {
            t.renderer.render(t.scene, t.camera);
        })
    }

    animationFrame() {
        const t = this

        requestAnimationFrame(function animate(nowMsec) {
            // lance la boucle
            requestAnimationFrame(animate);

            // measure time
            t.lastTimeMsec = t.lastTimeMsec || nowMsec - 1000 / 60
            let deltaMsec = Math.min(200, nowMsec - t.lastTimeMsec)
            t.lastTimeMsec = nowMsec

            // appelle les function d'update que l'on vait stocké dans un tableau
            t.onRenderFcts.forEach(function (onRenderFct) {
                onRenderFct(deltaMsec / 1000, nowMsec / 1000)
            })
        })
    }

}

new Sandboxe()