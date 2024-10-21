import * as THREE from 'three';

import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { InteractiveGroup } from 'three/addons/interactive/InteractiveGroup.js';
import { HTMLMesh } from 'three/addons/interactive/HTMLMesh.js';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';


import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';


const clock = new THREE.Clock();


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x555555);

let ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
let pointLight0 = new THREE.PointLight(0xffffff, 100);
pointLight0.position.set(5,4,5);
scene.add(pointLight0);



const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 50 );
camera.position.set( 0, 1.6, 2.5 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.autoClear = false;
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.xr.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
document.body.appendChild( renderer.domElement );

document.body.appendChild( VRButton.createButton( renderer ) );


// console.log(XRButton)
// console.log(XRControllerModelFactory)
const worldY = new THREE.Vector3(0, 1, 0.0).normalize();

const grid = new THREE.GridHelper(100, 100)
scene.add(grid)
// const grid2 = new THREE.GridHelper(10, 10)
// grid2.lookAt(worldY)
// scene.add(grid2)
const sphereGeometry = new THREE.SphereGeometry(0.5, 128, 128);
// const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'red' });
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(0, 2, -2);
scene.add(sphere);



// const vertexNormalsHelper = new VertexNormalsHelper(sphere, 0.1);
// scene.add(vertexNormalsHelper)



const geometry = new THREE.BufferGeometry();
geometry.setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 5 ) ] );

const controller1 = renderer.xr.getController( 0 );
controller1.add( new THREE.Line( geometry ) );
scene.add( controller1 );

const controller2 = renderer.xr.getController( 1 );
controller2.add( new THREE.Line( geometry ) );
scene.add( controller2 );

const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderer.xr.getControllerGrip( 0 );
controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
scene.add( controllerGrip1 );

const controllerGrip2 = renderer.xr.getControllerGrip( 1 );
controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
scene.add( controllerGrip2 );


const parameters = {
    scale: 1,
    wireframe: false,
    toggleWireframe: function() {
        this.wireframe = !this.wireframe;
        console.log(this)
        sphere.material.wireframe = this.wireframe;
    },
};

function onScaleChange() {
    sphere.scale.set(parameters.scale, parameters.scale, parameters.scale)

}

// function onWireframeChange() {
//     console.log("change")
//     sphere.material.wireframe = parameters.wireframe;
//     console.log(parameters)

// }

const gui = new GUI( { width: 300 } );
gui.add( parameters, 'scale', 0.0, 2.0 ).onChange( onScaleChange );
// gui.add( parameters, 'wireframe').onChange(onWireframeChange);
gui.add(parameters, "toggleWireframe").name("Toggle Wireframe").updateDisplay()
gui.domElement.style.visibility = 'hidden';


const group = new InteractiveGroup();
group.listenToPointerEvents( renderer, camera );
group.listenToXRControllerEvents( controller1 );
group.listenToXRControllerEvents( controller2 );
scene.add( group );

const mesh = new HTMLMesh( gui.domElement );
mesh.position.x = - 0.75;
mesh.position.y = 1.5;
mesh.position.z = - 0.5;
mesh.rotation.y = Math.PI / 4;
mesh.scale.setScalar( 2 );
group.add( mesh );

const stats = new Stats();
stats.dom.style.width = '80px';
stats.dom.style.height = '48px';
document.body.appendChild( stats.dom );

const statsMesh = new HTMLMesh( stats.dom );
statsMesh.position.x = - 0.75;
statsMesh.position.y = 1.7;
statsMesh.position.z = - 0.6;
statsMesh.rotation.y = Math.PI / 4;
statsMesh.scale.setScalar( 2.5 );
group.add( statsMesh );












function animate() {
    clock.getDelta();
    const time = clock.elapsedTime;


    renderer.render( scene, camera );
    stats.update();

    statsMesh.material.map.update();

}

renderer.setAnimationLoop( animate );
