class Pong {
    constructor() {
        const t = this

        // variable urls
        THREEx.ArToolkitContext.baseURL = './assets/markers/'

        // taille de l'écran
        t.ww = window.innerWidth
        t.wh = window.innerHeight

        // toutes les couleurs du jeux
        t.colors = {
            raket: 0xff0000,
            plane: 0xffffff,
            angle: 0x0000ff
        }

        // fonctions à lancer pour animation
        t.onRenderFcts = []

        // scene
        t.scene = new THREE.Scene()

        // animationFrame
        t.lastTimeMsec = null

        // flag
        t.gameIsStarted = false

        // alert("fix colors")
        t.init()
    }

    init() {
        const t = this

        t.createRenderer()
        t.createCamera()
        t.createArToolKitSource()

        t.bindEvents()

        t.initArToolKitSource()
        t.initMarkers()
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
        document.body.appendChild(t.renderer.domElement)
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
        t.arToolkitSource.onResize()
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

    initMarkers() {
        const t = this

        /*
        * Premier marker
        * */
        // prépare les controles
        let markerPlayer1 = new THREE.Group
        markerPlayer1.name = 'player1'
        t.scene.add(markerPlayer1)
        let player1Controls = new THREEx.ArMarkerControls(t.arToolkitContext, markerPlayer1, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.hiro',
        })

        // création du block raquette
        let geometryPlayer1 = new THREE.BoxGeometry(2, 1, 1)
        let materialPlayer1 = new THREE.MeshBasicMaterial({color: t.colors.raket})
        let meshPlayer1 = new THREE.Mesh(geometryPlayer1, materialPlayer1)
        markerPlayer1.add(meshPlayer1)


        /*
        * Deuxième marker
        * */
        // prépare les controles
        let markerPlayer2 = new THREE.Group
        markerPlayer2.name = 'player2'
        t.scene.add(markerPlayer2)
        let player2Controls = new THREEx.ArMarkerControls(t.arToolkitContext, markerPlayer2, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.kanji',
        })

        // création du block raquette
        let geometryPlayer2 = new THREE.BoxGeometry(2, 1, 1)
        let materialPlayer2 = new THREE.MeshBasicMaterial({color: t.colors.raket})
        let meshPlayer2 = new THREE.Mesh(geometryPlayer2, materialPlayer2)
        markerPlayer2.add(meshPlayer2)

        /*
       * Angle Marker A
       * */
        // prépare les controles
        let markerAngleA = new THREE.Group
        markerAngleA.name = 'angleA'
        t.scene.add(markerAngleA)
        let markerAControls = new THREEx.ArMarkerControls(t.arToolkitContext, markerAngleA, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.letterA',
        })

        // création du block raquette
        let geometryAngleA = new THREE.BoxGeometry(1, 1, 1)
        let materialAngleA = new THREE.MeshBasicMaterial({color: t.colors.angle})
        let meshAngleA = new THREE.Mesh(geometryAngleA, materialAngleA)
        markerAngleA.add(meshAngleA)

        /*
        * Angle Marker B
        * */
        // prépare les controles
        let markerAngleB = new THREE.Group
        markerAngleB.name = 'angleB'
        t.scene.add(markerAngleB)
        let markerBControls = new THREEx.ArMarkerControls(t.arToolkitContext, markerAngleB, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.letterB',
        })

        // création du block raquette
        let geometryAngleB = new THREE.BoxGeometry(1, 1, 1)
        let materialAngleB = new THREE.MeshBasicMaterial({color: t.colors.angle})
        let meshAngleB = new THREE.Mesh(geometryAngleB, materialAngleB)
        markerAngleB.add(meshAngleB)


        /*
        * Angle Marker C
        * */
        // prépare les controles
        let markerAngleC = new THREE.Group
        markerAngleC.name = 'angleC'
        t.scene.add(markerAngleC)
        let markerCControls = new THREEx.ArMarkerControls(t.arToolkitContext, markerAngleC, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.letterC',
        })

        // création du block raquette
        let geometryAngleC = new THREE.BoxGeometry(1, 1, 1)
        let materialAngleC = new THREE.MeshBasicMaterial({color: t.colors.angle})
        let meshAngleC = new THREE.Mesh(geometryAngleC, materialAngleC)
        markerAngleC.add(meshAngleC)

        /*
        * Angle Marker D
        * */
        // prépare les controles
        let markerAngleD = new THREE.Group
        markerAngleD.name = 'angleD'
        t.scene.add(markerAngleD)
        let markerDControls = new THREEx.ArMarkerControls(t.arToolkitContext, markerAngleD, {
            type: 'pattern',
            patternUrl: THREEx.ArToolkitContext.baseURL + 'patt.letterD',
        })

        // création du block raquette
        let geometryAngleD = new THREE.BoxGeometry(1, 1, 1)
        let materialAngleD = new THREE.MeshBasicMaterial({color: t.colors.angle})
        let meshAngleD = new THREE.Mesh(geometryAngleD, materialAngleD)
        markerAngleD.add(meshAngleD)

    }

    initDetectMarker() {
        const t = this

        t.player1 = t.scene.getObjectByName('player1')
        t.player2 = t.scene.getObjectByName('player2')
        t.angleA = t.scene.getObjectByName('angleA')
        t.angleB = t.scene.getObjectByName('angleB')
        t.angleC = t.scene.getObjectByName('angleC')
        t.angleD = t.scene.getObjectByName('angleD')

        /*
        * Détection des markers
        * */
        let container = new THREE.Group
        t.scene.add(container)

        // attend que les 6 markers soient détectés et on retire la div scanning
        t.onRenderFcts.push(function () {

            // une fois que la partie est commencée on block l'exécution de la fonction
            if (t.gameIsStarted) return null;

            let player1Visible = t.player1.visible === true
            let player2Visible = t.player2.visible === true
            let angleAVisible = t.angleA.visible === true
            let angleBVisible = t.angleB.visible === true
            let angleCVisible = t.angleC.visible === true
            let angleDVisible = t.angleD.visible === true

            if (player1Visible && player2Visible && angleAVisible && angleBVisible && angleCVisible && angleDVisible) {
                document.querySelector('.scanningSpinner').style.display = 'none'
                t.startGame()
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

    startGame() {
        const t = this

        t.gameIsStarted = true

        t.createPlane()

        // let length = t.markerRoot1.position.distanceTo( t.markerRoot2.position )
        // let settings = {
        //     scene: t.scene,
        //     colors: t.colors
        // }
        // t.board = new Board(settings)

        // TODO === voir comment remettre quand devra sélectionner la taille terrain
        // /*
        // * Afficher la distance entre les deux markers
        // * */
        // // Création d'un canvas pour l'afficher
        // let canvas = document.createElement( 'canvas' );
        // canvas.width = 128;
        // canvas.height = 64;
        // let context = canvas.getContext( '2d' );
        // let texture = new THREE.CanvasTexture( canvas );
        // // Sprite : container pour le texte de la distance
        // let multiplyScalar = 0.5
        // let materialSprite = new THREE.SpriteMaterial({
        //     map: texture,
        //     color: 0xffffff,
        // });
        // let sprite = new THREE.Sprite( materialSprite );
        // sprite.scale.multiplyScalar(multiplyScalar)
        // container.add(sprite)
        // // mise à jour de la mesure à chaque fois que le request animation frame
        // t.onRenderFcts.push(function(){
        //     // change la position
        //     sprite.position.addVectors(markerRoot1.position, markerRoot2.position).multiplyScalar(multiplyScalar)
        //     // affiche le texte
        //
        //     let text = length.toFixed(2)
        //
        //     // mets le texte dans le sprite
        //     context.font = '40px monospace';
        //     context.clearRect( 0, 0, canvas.width, canvas.height );
        //     context.fillStyle = '#FFFFFF';
        //     context.fillText(text, canvas.width/4, 3*canvas.height/4 )
        //     sprite.material.map.needsUpdate = true
        // })
    }

    createPlane() {
        const t = this

        alert("create plane")

        // récupère nos marqueurs
        let angleA = t.scene.getObjectByName('angleA')
        let angleB = t.scene.getObjectByName('angleB')
        let angleC = t.scene.getObjectByName('angleC')
        let angleD = t.scene.getObjectByName('angleD')

        // ajoute un groupe pour contenir le terrain
        let container = new THREE.Group
        t.scene.add(container)

        let planeMaterial = new THREE.MeshBasicMaterial( {color: t.colors.plane })

        let planeGeometry = new THREE.Geometry()

        planeGeometry.vertices.push(new THREE.Vector3(1, 0, -3))
        planeGeometry.vertices.push(new THREE.Vector3(-1, 0, -3))
        planeGeometry.vertices.push(new THREE.Vector3(-1, 0, -3))
        planeGeometry.vertices.push(new THREE.Vector3(-1, 0, -3))
        planeGeometry.vertices.push(new THREE.Vector3(-1, 0, -3))

        planeGeometry.vertices[0].copy(angleA.position)
        planeGeometry.vertices[1].copy(angleB.position)
        planeGeometry.vertices[2].copy(angleC.position)
        planeGeometry.vertices[3].copy(angleD.position)
        planeGeometry.vertices[4].copy(angleD.position)

        // BESOIN ?
        planeGeometry.verticesNeedUpdate = true
        planeGeometry.computeBoundingSphere()
        planeGeometry.computeLineDistances()

        let plane = new THREE.Line(planeGeometry, planeMaterial)
        container.add(plane)
    }
}


// class Board {
//     constructor(settings) {
//         const t = this
//
//         t.length = Math.trunc(settings.length)
//         t.scene = settings.scene
//         t.colors = settings.colors
//
//         alert("length: "+ t.length)
//         t.init()
//     }
//
//     init() {
//         const t = this
//
//         t.createPlane()
//     }
//
//     createPlane() {
//         const t = this
//
//         // récupère nos marqueurs
//         let markerRoot1 = t.scene.getObjectByName('marker1')
//         let markerRoot2 = t.scene.getObjectByName('marker2')
//
//         // ajoute un groupe pour contenir le terrain
//         let container = new THREE.Group
//         t.scene.add(container)
//
//         let materialLine = new THREE.LineDashedMaterial( {
//             dashSize: 1,
//             gapSize: 1,
//         } );
//         let geometryLine = new THREE.Geometry()
//         geometryLine.vertices.push(new THREE.Vector3(1, 0, -3))
//         geometryLine.vertices.push(new THREE.Vector3(-1, 0, -3))
//
//         geometryLine.vertices[0].copy(markerRoot1.position)
//         geometryLine.vertices[1].copy(markerRoot2.position)
//         geometryLine.verticesNeedUpdate = true
//         geometryLine.computeBoundingSphere();
//         geometryLine.computeLineDistances();
//
//         let lineMesh = new THREE.Line(geometryLine, materialLine)
//         container.add(lineMesh)
//     }
// }


// /*
// * Variables
// * */
// // url qui va nous permettre d'aller chercher nos composants
// THREEx.ArToolkitContext.baseURL = './assets/markers/'
// let ww = window.innerWidth
// let wh = window.innerHeight
// const colors = {
//     raket: "0xffff00",
// }
//
// // tableau de fonction pour la boucle de rendu
// var onRenderFcts= []
// var scene	= new THREE.Scene()
//
//
// /*
// * Render
// * */
// // TODO === regarder les fonctionnalités du render
// let renderer	= new THREE.WebGLRenderer({
//     antialias: true,
//     alpha: true
// })
// renderer.setClearColor(new THREE.Color('lightgrey'), 0)
// renderer.setSize( ww, wh )
// renderer.domElement.style.position = 'absolute'
// renderer.domElement.style.top = '0'
// renderer.domElement.style.left = '0'
// document.body.appendChild( renderer.domElement )
//
// /*
// * Camera
// * */
// let camera = new THREE.Camera()
// scene.add(camera)
//
// /*
// * Gérer ArToolkitSource
// * */
// let arToolkitSource = new THREEx.ArToolkitSource({
//     // lecture depuis la webcam
//     sourceType : 'webcam',
// })
// arToolkitSource.init(function onReady(){
//     onResize()
// })
//
// /*
// * Gérer Resize
// * */
// window.addEventListener('resize', onResize )
//
// function onResize(){
//     arToolkitSource.onResize()
//     arToolkitSource.copyElementSizeTo(renderer.domElement)
//     if( arToolkitContext.arController !== null ){
//         arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
//     }
// }
//
// /*
// * Intialise l' ArToolkitContext
// * */
// // créer un context
// let arToolkitContext = new THREEx.ArToolkitContext({
//     cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'camera_para.dat',
//     detectionMode: 'mono',
// })
// // lance init
// arToolkitContext.init(function onCompleted(){
//     // TODO : à checker === copy projection matrix to camera
//     camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
// })
// // update toolikt à chaque image
// onRenderFcts.push(function(){
//     if( arToolkitSource.ready === false )	return
//     arToolkitContext.update( arToolkitSource.domElement )
// })
//
//
// /*
//    * Création des markers
//    * */
// ;(function(){
//
//
//     /*
//     * Premier marker
//     * */
//     // prépare les controles
//     let markerRoot1 = new THREE.Group
//     markerRoot1.name = 'marker1'
//     scene.add(markerRoot1)
//     let markerRoot1Controls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
//         type : 'pattern',
//         patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.hiro',
//     })
//
//     // création du block raquette
//     let geometryMarker1 = new THREE.BoxGeometry( 2, 1, 1 )
//     let materialMarker1 = new THREE.MeshBasicMaterial({color: colors.raket});
//     let meshMarker1 = new THREE.Mesh( geometryMarker1, materialMarker1 );
//     markerRoot1.add( meshMarker1 );
//
//
//     /*
//     * Deuxième marker
//     * */
//     // prépare les controles
//     let markerRoot2 = new THREE.Group
//     markerRoot2.name = 'marker2'
//     scene.add(markerRoot2)
//     let markerRoot2Controls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
//         type : 'pattern',
//         patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.kanji',
//     })
//     // création du block raquette
//     let geometryMarker2	= new THREE.BoxGeometry( 2, 1, 1 )
//     let materialMarker2 = new THREE.MeshBasicMaterial({color: colors.raket})
//     let meshMarker2	= new THREE.Mesh( geometryMarker2, materialMarker2 )
//     markerRoot2.add( meshMarker2 )
// })()
//
//
//
// /*
// * Création de la ligne qui mesure
// * */
// ;(function(){
//     let markerRoot1 = scene.getObjectByName('marker1')
//     let markerRoot2 = scene.getObjectByName('marker2')
//
//     /*
//     * Détection des markers
//     * */
//     let container = new THREE.Group
//     scene.add(container)
//     // attend que les deux markers soient détectés et on retire la div scanning
//     onRenderFcts.push(function(){
//         if( markerRoot1.visible === true && markerRoot2.visible === true ){
//             container.visible = true
//             document.querySelector('.scanningSpinner').style.display = 'none'
//         }else{
//             container.visible = false
//             document.querySelector('.scanningSpinner').style.display = ''
//         }
//     })
//
//     // /*
//     // * Création de la ligne
//     // * */
//     // let materialLine = new THREE.LineDashedMaterial( {
//     //     dashSize: 1,
//     //     gapSize: 1,
//     // } );
//     // let geometryLine = new THREE.Geometry();
//     // geometryLine.vertices.push(new THREE.Vector3(1, 0, -3));
//     // geometryLine.vertices.push(new THREE.Vector3(-1, 0, -3));
//     // let lineMesh = new THREE.Line(geometryLine, materialLine);
//     // container.add(lineMesh)
//     // // update lineMesh
//     // onRenderFcts.push(function(){
//     //     var geometry = lineMesh.geometry
//     //     geometry.vertices[0].copy(markerRoot1.position)
//     //     geometry.vertices[1].copy(markerRoot2.position)
//     //     geometry.verticesNeedUpdate = true
//     //     geometry.computeBoundingSphere();
//     //     geometry.computeLineDistances();
//     //
//     //     var length = markerRoot1.position.distanceTo(markerRoot2.position)
//     //     lineMesh.material.scale = length * 10
//     //     lineMesh.material.needsUpdate = true
//     // })
//     /*
//     * Afficher la distance entre les deux markers
//     * */
//     // Création d'un canvas pour l'afficher
//     let canvas = document.createElement( 'canvas' );
//     canvas.width = 128;
//     canvas.height = 64;
//     let context = canvas.getContext( '2d' );
//     let texture = new THREE.CanvasTexture( canvas );
//     // Sprite : container pour le texte de la distance
//     let multiplyScalar = 0.5
//     let materialSprite = new THREE.SpriteMaterial({
//         map: texture,
//         color: 0xffffff,
//     });
//     let sprite = new THREE.Sprite( materialSprite );
//     sprite.scale.multiplyScalar(multiplyScalar)
//     container.add(sprite)
//     // mise à jour de la mesure à chaque fois que le request animation frame
//     onRenderFcts.push(function(){
//         // change la position
//         sprite.position.addVectors(markerRoot1.position, markerRoot2.position).multiplyScalar(multiplyScalar)
//         // affiche le texte
//         let length = markerRoot1.position.distanceTo(markerRoot2.position)
//         let text = length.toFixed(2)
//
//         // mets le texte dans le sprite
//         context.font = '40px monospace';
//         context.clearRect( 0, 0, canvas.width, canvas.height );
//         context.fillStyle = '#FFFFFF';
//         context.fillText(text, canvas.width/4, 3*canvas.height/4 )
//         sprite.material.map.needsUpdate = true
//     })
//
// })()
// /*
// * Rendu de la scene
// * */
// onRenderFcts.push(function(){
//     renderer.render( scene, camera );
// })
// // animationFrame
// let lastTimeMsec= null
// requestAnimationFrame(function animate(nowMsec){
//     // lance la boucle
//     requestAnimationFrame( animate );
//     // measure time
//     lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
//     let deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
//     lastTimeMsec	= nowMsec
//     // appelle les function d'update que l'on vait stocké dans un tableau
//     onRenderFcts.forEach(function(onRenderFct){
//         onRenderFct(deltaMsec/1000, nowMsec/1000)
//     })
// })


new Pong()