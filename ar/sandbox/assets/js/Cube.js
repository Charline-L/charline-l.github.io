class Cube {
    constructor(infos, scene, domEvents) {
        const t = this

        // infomations de positions du cube
        t.x = infos.position.x
        t.y = infos.position.y
        t.z = infos.position.z

        t.id = infos._id

        t.wireframe = infos.wireframe
        t.color = infos.color
        t.alpha = infos.alpha

        // scene récupéré depuis la classe Sandboxe
        t.scene = scene

        // domeEvents récupéré
        t.domEvents = domEvents

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
        let geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)
        let material = new THREE.MeshBasicMaterial({
            color: t.color,
            wireframe: t.wireframe,
            transparent: true,
            opacity: t.alpha
        })
        t.mesh = new THREE.Mesh(geometry, material)

        // positionne le cube
        t.mesh.position.x = (t.x * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.z = (t.z * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        t.mesh.position.y = t.y

        // donner nom unique au cube
        t.mesh.name = t.id
        // t.mesh.new = true
        t.mesh.active = false

        // ajoute à notre groupe qui va l'ajouter à la scène
        grid.add(t.mesh)
    }

    bindEvents() {
        const t = this

        // si click sur un cube on lui change son "activité"
        t.domEvents.addEventListener(t.mesh, 'click', function () {

            // Si on est en mode edition
            if (window.isEdition) {

                if (t.mesh.active) t.cubeInactive()
                else t.cubeActive()
            }
        })

        // event trigger dans la class Sandbox
        window.addEventListener("changeColor", (e) => {
            t.changeColor(e)
        })
    }

    cubeActive() {
        const t = this

        // Cube actif
        t.mesh.active = true

        // Afficher le button remove
        window.dispatchEvent( new CustomEvent('showButtonDelete') )
    }

    cubeInactive() {
        const t = this

        // Cube inactif
        t.mesh.active = false

        // Ne pas afficher le button remove
        window.dispatchEvent( new CustomEvent('hideButtonDelete') )
    }

    changeColor(e){
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
}