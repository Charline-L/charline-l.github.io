class Cube {
    constructor(cube, three, dom) {
        const t = this

        // infomations de positions du cube
        t.x = cube.position.x
        t.y = cube.position.y
        t.z = cube.position.z

        t.id = cube._id

        t.wireframe = cube.wireframe
        t.color = cube.color
        t.alpha = cube.alpha
        t.visible = cube.visible

        // scene récupéré depuis la classe Sandboxe
        t.scene = three.scene

        // domeEvents récupéré
        t.domEvents = three.domEvents

        // elements du dom
        t.$colorSlideChroma = dom.$colorSlideChroma

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        t.init()
    }

    init() {
        const t = this

        t.defineTextures()
        t.appendCube()
        t.bindEvents()
    }

    defineTextures() {
        const t = this

        t.texture = {}

        t.texture.reset = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: false,
            transparent: true,
            opacity: 1
        })

        t.texture.wireframe = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 1
        })

        t.texture.actif = new THREE.MeshBasicMaterial({
            color: t.color,
            wireframe: false,
            transparent: true,
            opacity: t.alpha
        })
    }

    appendCube() {
        const t = this

        // récupère notre grille dans notre scene
        let grid = t.scene.getObjectByName('grid')

        // défini la forme / texture du cube
        t.geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)

        // défini la texture du cube
        let material = t.texture.reset
        if (t.visible && !t.wireframe) material = t.texture.actif
        else if (t.visible && t.wireframe) material = t.texture.wireframe

        t.mesh = new THREE.Mesh(t.geometry, material)

        // positionne le cube
        t.mesh.position.x = (t.x * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.z = (t.z * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.y = t.y

        // donne nom unique au cube
        t.mesh.name = t.id

        // défini si a un wireframe
        t.mesh.wireframe = t.wireframe

        // défini si visble
        t.mesh.visible = t.visible && !t.wireframe

        // prépare la selection
        t.mesh.selected = false

        // ajoute à notre groupe qui va l'ajouter à la scène
        grid.add(t.mesh)
    }

    bindEvents() {
        const t = this

        // si click sur un cube on lui change son "activité"
        t.domEvents.addEventListener(t.mesh, 'click', function () {

            // si on est en mode edition on peut changer la couleur du cube
            if (window.isEdition) {

                if (t.mesh.selected) t.cubeDeselected()
                else t.cubeSelected()
            }

            // si on est en mode ajout on peut ajouter des cubes
            if (window.isAddition){

                if (t.mesh.wireframe) t.addCube()
            }
        })

        // event trigger dans la class Sandbox
        window.addEventListener("changeColor", t.changeColor.bind(t))
        window.addEventListener("removeCube", t.removeCube.bind(t))
        window.addEventListener("showWireframe", t.showWireframe.bind(t))
        window.addEventListener("hideWireframe", t.hideWireframe.bind(t))
    }

    cubeSelected() {
        const t = this

        // Cube actif
        t.mesh.selected = true

        // ajoute le contour
        let edges = new THREE.EdgesGeometry( t.geometry )
        t.line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) )
        t.mesh.add( t.line )

        // Afficher le button remove
        window.dispatchEvent(new CustomEvent('showButtonDelete'))
    }

    cubeDeselected() {
        const t = this

        // Cube inactif
        t.mesh.selected = false

        // enleve le contour
        t.mesh.remove(t.line)

        // Ne pas afficher le button remove
        window.dispatchEvent(new CustomEvent('hideButtonDelete'))
    }

    changeColor(e) {
        const t = this

        if (t.mesh.selected) {

            let material = new THREE.MeshBasicMaterial({
                color: Number(e.detail.color),
                wireframe: t.mesh.wireframe,
                transparent: true,
                opacity: t.alpha
            })

            t.mesh.material = material
        }
    }

    removeCube() {
        const t = this

        if (t.mesh.selected) {

            // reset les variables
            t.mesh.selected = false
            t.mesh.visible = false
        }
    }

    addCube() {
        const t = this

        // reset des variables
        t.mesh.wireframe = false
        t.mesh.selected = true

        // trigger le changement de couleur
        t.$colorSlideChroma.dispatchEvent(new Event('change'))

        // on passe le cube en sélection
        t.cubeSelected()
    }

    showWireframe(){
        const t = this

        if (t.mesh.wireframe) t.mesh.visible = true
    }

    hideWireframe(){
        const t = this

        if (t.mesh.wireframe) t.mesh.visible = false
    }
}