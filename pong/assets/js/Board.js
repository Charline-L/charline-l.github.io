class Board {
    constructor(settings) {
        const t = this

        t.length = Math.trunc(settings.length)
        t.scene = settings.scene
        t.colors = settings.colors

        alert("length: "+ t.length)
        t.init()
    }

    init() {
        const t = this

        t.createPlane()
    }

    createPlane() {
        const t = this

        // récupère nos marqueurs
        let markerRoot1 = t.scene.getObjectByName('marker1')
        let markerRoot2 = t.scene.getObjectByName('marker2')

        // ajoute un groupe pour contenir le terrain
        let container = new THREE.Group
        t.scene.add(container)

        let materialLine = new THREE.LineDashedMaterial( {
            dashSize: 1,
            gapSize: 1,
        } );
        let geometryLine = new THREE.Geometry()
        geometryLine.vertices.push(new THREE.Vector3(1, 0, -3))
        geometryLine.vertices.push(new THREE.Vector3(-1, 0, -3))

        geometryLine.vertices[0].copy(markerRoot1.position)
        geometryLine.vertices[1].copy(markerRoot2.position)
        geometryLine.verticesNeedUpdate = true
        geometryLine.computeBoundingSphere();
        geometryLine.computeLineDistances();

        let lineMesh = new THREE.Line(geometryLine, materialLine)
        container.add(lineMesh)
    }
}
