class Cube {
    constructor(infos, scene, domEvents) {
        const t = this

        // infomations de positions du cube
        t.x = infos.position.x
        t.y = infos.position.y
        t.z = infos.position.z

        t.id = infos._id

        t.color = infos.color
        t.alpha = infos.alpha

        // scene récupéré depuis la classe Sandboxe
        t.scene = scene

        // domeEvents récupéré
        t.domEvents = domEvents

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        // flag
        t.modeEdition = false

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
            wireframe: false,
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
        t.mesh.new = true
        t.mesh.active = false

        // ajoute à notre groupe qui va l'ajouter à la scène
        grid.add(t.mesh)
    }

    bindEvents() {
        const t = this

        t.domEvents.addEventListener(t.mesh, 'click', function () {

            // Si on est en mode edition
            if (t.modeEdition) {

                // Si le cube existe déjà
                if (!t.mesh.new) {
                    // Si le cube est déjà actif
                    if (t.mesh.active) {
                        // Désactivation du cube
                        t.cubeInactive(t.mesh.name)
                    } else {
                        // Activation du cube
                        t.cubeActive(t.mesh.name)
                    }
                } else {
                    // Ajout du cube
                    t.updateMesh(t.mesh.name)
                }

                // Cube ajouté
                t.mesh.new = false
            }
        })
    }

    cubeActive(name) {
        const t = this

        let mesh = t.scene.getObjectByName(name)

        // Cube actif
        mesh.active = true

        // Afficher le button remove
        window.dispatchEvent(window.customEvents.showButtonRemove)
    }

    cubeInactive(name) {
        const t = this

        let mesh = t.scene.getObjectByName(name)

        // Cube inactif
        mesh.active = false

        // Ne pas afficher le button remove
        window.dispatchEvent(window.customEvents.hideButtonRemove)
    }

    updateMesh(name) {
        const t = this

        let mesh = t.scene.getObjectByName(name)
        let material = new THREE.MeshBasicMaterial({color: t.color})

        mesh.material = material
    }
}