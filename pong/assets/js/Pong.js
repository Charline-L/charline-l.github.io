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
            raket: "0xffff00",
        }

        // fonctions à lancer pour animation
        t.onRenderFcts = []

        // scene
        t.scene = new THREE.Scene()

        // animationFrame
        t.lastTimeMsec= null


        alert("in constructor")
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
        t.initCalcDistance()

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
        arToolkitSource.onResize()
        arToolkitSource.copySizeTo(renderer.domElement)
        if (arToolkitContext.arController !== null) {
            arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
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
        let markerRoot1 = new THREE.Group
        markerRoot1.name = 'marker1'
        t.scene.add(markerRoot1)
        let markerRoot1Controls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
            type : 'pattern',
            patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.hiro',
        })

        // création du block raquette
        let geometryMarker1 = new THREE.BoxGeometry( 2, 1, 1 )
        let materialMarker1 = new THREE.MeshBasicMaterial({color: colors.raket});
        let meshMarker1 = new THREE.Mesh( geometryMarker1, materialMarker1 );
        markerRoot1.add( meshMarker1 );


        /*
        * Deuxième marker
        * */
        // prépare les controles
        let markerRoot2 = new THREE.Group
        markerRoot2.name = 'marker2'
        t.scene.add(markerRoot2)
        let markerRoot2Controls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot2, {
            type : 'pattern',
            patternUrl : THREEx.ArToolkitContext.baseURL + 'patt.kanji',
        })

        // création du block raquette
        let geometryMarker2	= new THREE.BoxGeometry( 2, 1, 1 )
        let materialMarker2 = new THREE.MeshBasicMaterial({color: colors.raket})
        let meshMarker2	= new THREE.Mesh( geometryMarker2, materialMarker2 )
        markerRoot2.add( meshMarker2 )
    }

    initCalcDistance() {
        const t = this

        let markerRoot1 = t.scene.getObjectByName('marker1')
        let markerRoot2 = t.scene.getObjectByName('marker2')

        /*
        * Détection des markers
        * */
        let container = new THREE.Group
        t.scene.add(container)
        // attend que les deux markers soient détectés et on retire la div scanning
        t.onRenderFcts.push(function(){
            if( markerRoot1.visible === true && markerRoot2.visible === true ){
                container.visible = true
                document.querySelector('.scanningSpinner').style.display = 'none'
            }else{
                container.visible = false
                document.querySelector('.scanningSpinner').style.display = ''
            }
        })

        /*
        * Afficher la distance entre les deux markers
        * */
        // Création d'un canvas pour l'afficher
        let canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 64;
        let context = canvas.getContext( '2d' );
        let texture = new THREE.CanvasTexture( canvas );
        // Sprite : container pour le texte de la distance
        let multiplyScalar = 0.5
        let materialSprite = new THREE.SpriteMaterial({
            map: texture,
            color: 0xffffff,
        });
        let sprite = new THREE.Sprite( materialSprite );
        sprite.scale.multiplyScalar(multiplyScalar)
        container.add(sprite)
        // mise à jour de la mesure à chaque fois que le request animation frame
        t.onRenderFcts.push(function(){
            // change la position
            sprite.position.addVectors(markerRoot1.position, markerRoot2.position).multiplyScalar(multiplyScalar)
            // affiche le texte
            let length = markerRoot1.position.distanceTo(markerRoot2.position)
            let text = length.toFixed(2)

            // mets le texte dans le sprite
            context.font = '40px monospace';
            context.clearRect( 0, 0, canvas.width, canvas.height );
            context.fillStyle = '#FFFFFF';
            context.fillText(text, canvas.width/4, 3*canvas.height/4 )
            sprite.material.map.needsUpdate = true
        })
    }

    initRenderer() {
        const t = this

        // ajoute renderer au tableau d'update
        t.onRenderFcts.push(function(){
            t.renderer.render( t.scene, t.camera );
        })
    }

    animationFrame() {
        const t = this

        requestAnimationFrame(function animate(nowMsec){
            // lance la boucle
            requestAnimationFrame( animate );

            // measure time
            t.lastTimeMsec	= t.lastTimeMsec || nowMsec-1000/60
            let deltaMsec	= Math.min(200, nowMsec - t.lastTimeMsec)
            t.lastTimeMsec	= nowMsec

            // appelle les function d'update que l'on vait stocké dans un tableau
            t.onRenderFcts.forEach(function(onRenderFct){
                onRenderFct(deltaMsec/1000, nowMsec/1000)
            })
        })
    }
}


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
//     arToolkitSource.copySizeTo(renderer.domElement)
//     if( arToolkitContext.arController !== null ){
//         arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)
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