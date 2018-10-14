class Cube {
    constructor(infos, scene) {
        const t = this

        alert("in cube")

        // infomations de positions du cube
        t.x = infos.position.x
        t.y = infos.position.y
        t.z = infos.position.z

        t.id = infos._id

        t.color = infos.color
        t.alpha = infos.alpha

        // scene récupéré depuis la classe Sandboxe
        t.scene = scene

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        // // toutes les couleurs
        // t.colors = {
        //     white: 0xffffff,
        //     blue: 0x00ffff
        // }

        t.init()
    }

    init() {
        const t = this

        t.appendCube()
    }

    appendCube() {
        const t = this

        // récupère notre grille dans notre scene
        let grid = t.scene.getObjectByName('grid')

        console.log("grid", grid)

        // défini la forme / texture du cube
        let geometry = new THREE.BoxGeometry(t.sizeCube, t.sizeCube, t.sizeCube)
        let material = new THREE.MeshBasicMaterial({color: t.color, wireframe: false})
        let mesh = new THREE.Mesh(geometry, material)

        // positionne le cube
        mesh.position.x = (t.x * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        mesh.position.z = (t.z * t.sizeCube) - ((t.gridSize - 1) / 2 * t.sizeCube)
        mesh.position.y = t.y

        // donner nom unique au cube
        mesh.name = t.id

        // ajoute à notre groupe qui va l'ajouter à la scène
        grid.add(mesh)
    }
}