class Cube {
    constructor(infos, scene) {
        const t = this

        // infomations de positions du cube
        t.x = infos.position.x
        t.y = infos.position.y
        t.z = infos.position.z

        t.color = infos.color
        t.alpha = infos.alpha

        // scene récupéré depuis la classe Sandboxe
        t.scene = scene

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        // toutes les couleurs
        t.colors = {
            white: 0xffffff,
            blue: 0x00ffff
        }

        t.init()
    }

    init() {
        const t = this

        t.appendCube()
    }

    appendCube() {
        const t = this

        let grid = t.scene.getObjectByName('grid')

        let geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)
        let material = new THREE.MeshBasicMaterial({color: t.colors.white, wireframe: true})
        let mesh = new THREE.Mesh(geometry, material)

        mesh.position.x = (t.x * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        mesh.position.z = (t.z * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)

        mesh.name = 'mesh-' + count++

        // ajoute à notre groupe
        grid.add(mesh)
    }
}