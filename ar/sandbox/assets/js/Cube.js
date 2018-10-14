class Cube {
    constructor(cube, three) {
        const t = this

        // infomations de positions du cube
        t.x = cube.position.x
        t.y = cube.position.y
        t.z = cube.position.z

        t.id = cube._id

        t.wireframe = cube.wireframe
        t.color = cube.color
        t.alpha = cube.alpha

        // scene récupéré depuis la classe Sandboxe
        t.scene = three.scene

        // domeEvents récupéré
        t.domEvents = three.domEvents

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        t.init()
    }

    init() {
        const t = this

        t.appendCube()
        t.bindEvents()
    }

    appendCube() {
        const t = this

        // récupère notre grille dans notre scene
        let grid = t.scene.getObjectByName('grid')

        // défini la forme / texture du cube
        t.geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)
        let material = new THREE.MeshBasicMaterial({
            color: t.color,
            wireframe: t.wireframe,
            transparent: true,
            opacity: t.alpha
        })
        t.mesh = new THREE.Mesh(t.geometry, material)

        // positionne le cube
        t.mesh.position.x = (t.x * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.z = (t.z * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.y = t.y

        // donner nom unique au cube
        t.mesh.name = t.id
        t.mesh.active = false

        // ajoute à notre groupe qui va l'ajouter à la scène
        grid.add(t.mesh)
    }

    bindEvents() {
        const t = this

        // si click sur un cube on lui change son "activité"
        t.domEvents.addEventListener(t.mesh, 'click', function () {

            // si on est en mode edition on peut changer la couleur du cube
            if (window.isEdition) {

                if (t.mesh.active) t.cubeInactive()
                else t.cubeActive()
            }

            // si on est en mode ajout on peut ajouter des cubes
            if (window.isAdding){

                t.addCube()
            }
        })

        // event trigger dans la class Sandbox
        window.addEventListener("changeColor", t.changeColor.bind(t))

        window.addEventListener("removeCube", t.removeCube.bind(t))
    }

    cubeActive() {
        const t = this

        // Cube actif
        t.mesh.active = true

        // ajoute le contour
        let edges = new THREE.EdgesGeometry( t.geometry )
        t.line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) )
        t.mesh.add( t.line )

        // Afficher le button remove
        window.dispatchEvent(new CustomEvent('showButtonDelete'))
    }

    cubeInactive() {
        const t = this

        // Cube inactif
        t.mesh.active = false

        // enleve le contour
        t.mesh.remove(t.line)

        // Ne pas afficher le button remove
        window.dispatchEvent(new CustomEvent('hideButtonDelete'))
    }

    changeColor(e) {
        const t = this

        if (t.mesh.active) {

            let material = new THREE.MeshBasicMaterial({
                color: Number(e.detail.color),
                wireframe: t.wireframe,
                transparent: true,
                opacity: t.alpha
            })

            t.mesh.material = material
        }
    }

    removeCube() {
        const t = this

        if (t.mesh.active) {

            t.mesh.active = false
            t.mesh.visible = false

            // TODO : envoyer au server que le cube a été effacé
        }
    }

    addCube() {
        const t = this

        // TODO : envoyer au server que le cube a été créé
    }
}