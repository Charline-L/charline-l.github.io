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
        t.outScene = three.outScene

        // domeEvents récupéré
        t.domEvents = three.domEvents

        // grille
        t.gridSize = 3
        t.sizeCube = 1

        t.init()
    }

    init() {
        const t = this

        t.createMaterialSelected()
        t.appendCube()
        t.bindEvents()
    }

    createMaterialSelected() {
        const t = this

        let vxs = `
            uniform float offset;
            void main() {
               vec4 pos = modelViewMatrix * vec4( position + normal * offset, 1.0 );
               gl_Position = projectionMatrix * pos;
            }
        `

        let fgs = `
            void main(){
              gl_FragColor = vec4( 1.0, 1.0, 0.0, 1.0 );
            }
        `
        let uniforms = {
            offset: {
                type: 'f',
                value: 1
            }
        }

        t.matShader = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vxs,
            fragmentShader: fgs
        });
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

        // ajoute le contour
        let outline = new THREE.Mesh(t.geometry, t.matShader)
        outline.material.depthWrite = false
        outline.name = t.id + 'outline'
        t.outScene.add(outline)

        // Afficher le button remove
        window.dispatchEvent(new CustomEvent('showButtonDelete'))
    }

    cubeInactive() {
        const t = this

        // Cube inactif
        t.mesh.active = false

        // enleve le contout
        let outline = t.outScene.getObjectByName(t.id+'outline')
        t.outScene.remove(outline)

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
}