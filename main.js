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
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


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

// const orbitControls = new OrbitControls(camera, renderer.domElement);
// orbitControls.target.set(0, 1, -1);
// orbitControls.update()

// // console.log(XRButton)
// // console.log(XRControllerModelFactory)
// const worldY = new THREE.Vector3(0, 1, 0.0).normalize();

const grid = new THREE.GridHelper(20, 20)
scene.add(grid)



const axisX = new THREE.Vector3(1, 0, 0);
const axisY = new THREE.Vector3(0, 1, 0);
const axisXY = new THREE.Vector3(1, 1, 0).normalize();
const axisZ = new THREE.Vector3(0, 0, 1);

const radius = 1;
const alpha = Math.PI/10;
const beta = Math.PI/2 - alpha; 
const a = Math.sin(alpha) * radius;
const b = Math.cos(alpha) * radius;
const c = Math.tan(beta) * b;

const coneHeight = c ;
const coneWidth = b ;

const resolution = 32;

const material = new THREE.MeshLambertMaterial( { color: 0xFFFFFF, wireframe: false } ); 

const torusGeometry = new THREE.TorusGeometry( 0.075, 0.025, resolution, resolution ); 
const torus = new THREE.Mesh( torusGeometry, material );

torus.scale.z *= 0.5
scene.add( torus );

const coneGeometry = new THREE.ConeGeometry(coneWidth, coneHeight, resolution, 1);
coneGeometry.translate(0, coneHeight / 2 + a, 0);
coneGeometry.scale(0.036, 0.036, 0.036)
coneGeometry.translate(0, 0.145, 0); 

const sphereGeometry = new THREE.SphereGeometry(1, resolution, resolution);
sphereGeometry.scale(0.036, 0.036, 0.036)
sphereGeometry.translate(0, 0.145, 0);


const spiral = new THREE.Group();
scene.add(spiral);

const nbSpokes = 6;
const scaleFactor = 1.25
const halfTurn = new THREE.Quaternion().setFromAxisAngle(axisZ, Math.PI);
const quat = new THREE.Quaternion();

for(let i = 0; i < nbSpokes; ++i) {
	const spoke = new THREE.Group();
	spiral.add(spoke);

	const cone0 = new THREE.Mesh(coneGeometry, material);
	const cone1 = new THREE.Mesh(coneGeometry, material);
	const sphere0 = new THREE.Mesh(sphereGeometry, material);
	const sphere1 = new THREE.Mesh(sphereGeometry, material);

	cone0.applyQuaternion(halfTurn);
	sphere0.applyQuaternion(halfTurn);

	spoke.add(cone0, cone1, sphere0, sphere1);
	quat.setFromAxisAngle(axisZ, (i-1)*Math.PI / 5.5);
	spoke.applyQuaternion(quat);

	spoke.scale.multiplyScalar(Math.pow(scaleFactor, i));
	spoke.scale.z *= 0.5
	spoke.scale.y *= 1.2
}

spiral.position.set(0, 1, -1)
torus.position.set(0, 1, -1)


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
    speed: 1,
    wireframe: false,
    toggleWireframe: function() {
        this.wireframe = !this.wireframe;
        console.log(this)
        // sphere.material.wireframe = this.wireframe;
        material.wireframe = this.wireframe
    },
};

// function onScaleChange() {
//     sphere.scale.set(parameters.scale, parameters.scale, parameters.scale)

// }

// function onWireframeChange() {
//     console.log("change")
//     sphere.material.wireframe = parameters.wireframe;
//     console.log(parameters)

// }

const gui = new GUI( { width: 300 } );
gui.add( parameters, 'speed', 0.0, 4.0 );
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

    spiral.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axisXY, parameters.speed * 0.2* Math.PI / 100))

    renderer.render( scene, camera );
    stats.update();

    statsMesh.material.map.update();

}

renderer.setAnimationLoop( animate );
