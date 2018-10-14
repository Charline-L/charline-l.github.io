class Sandboxe {
    constructor(infos) {
        const t = this

        t.pattern = infos.pattern
        t.id = infos.id

        // DOM
        t.$container = document.querySelector(".sandboxe-game__canvas")
        t.$header = document.querySelector(".sandboxe-game__header")

        // variable urls
        THREEx.ArToolkitContext.baseURL = './assets/markers/'

        // taille de l'écran
        t.ww = window.innerWidth
        t.wh = window.innerWidth

        // // toutes les couleurs
        // t.colors = {
        //     white: 0xffffff,
        //     blue: 0x00ffff
        // }

        // loop des functions
        t.onRenderFcts = []

        // scene
        t.scene = new THREE.Scene()

        // flag
        t.isSeen = false
        // t.elementSelected = false

        // // grille
        // t.gridSize = 3
        // t.sizeCube = 1

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

        // permet d'intéragir avec le DOM
        t.domEvents = new THREEx.DomEvents(t.camera, t.renderer.domElement)
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

        // // pour le nom des markers
        // let count = 0
        //
        // // création de la grille lui sera liée
        // for (let i = 0; i < t.gridSize; i++) {
        //     for (let j = 0; j < t.gridSize; j++) {
        //
        //         let geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)
        //         let material = new THREE.MeshBasicMaterial({color: t.colors.white, wireframe: true})
        //         let mesh = new THREE.Mesh(geometry, material)
        //
        //         mesh.position.x = (i * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        //         mesh.position.z = (j * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        //
        //         mesh.name = 'mesh-' + count++
        //
        //         // ajoute à notre groupe
        //         grid.add(mesh)
        //
        //         // chacun des block on ajoute un écouteur d'évènements
        //         t.domEvents.addEventListener(mesh, 'click', () => {
        //             t.updateMesh(mesh.name)
        //         })
        //     }
        // }
    }

    initDetectMarker() {
        const t = this

        let grid = t.scene.getObjectByName('grid')

        t.onRenderFcts.push(() => {

            if (grid.visible) t.getCubes()
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

    // updateMesh(name) {
    //     const t = this
    //
    //     let mesh = t.scene.getObjectByName(name)
    //     let material = new THREE.MeshBasicMaterial({color: t.colors.blue})
    //
    //     mesh.material = material
    // }

    getCubes(){
        const t = this

        // si déjà vu on ne rapelle pas les classes
        if (t.isSeen) return null;

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
              alpha: 1,
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
                _id: 123456,
            }
        ]

        for (let cubeRegister of cubesRegistered) new Cube(cubeRegister, t.scene)
    }
}

// new Sandboxe()