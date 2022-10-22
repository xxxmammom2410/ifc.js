import {
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer,
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils,
  Clock
} from 'three';

import CameraControls from 'camera-controls';

// 1 The scene
const scene = new Scene()
  
// 2 The Object
const geometry = new BoxGeometry(0.5,0.5,0.5);
const material = new MeshBasicMaterial({color:'orange'});
const material_green = new MeshBasicMaterial({color:0x00ff00});
const material_blue = new MeshBasicMaterial({color:0x0000ff});
const cubeMesh = new Mesh( geometry, material);
const greenCube = new Mesh( geometry, material_green);
const blueCube = new Mesh( geometry, material_blue);

greenCube.position.x += 1;
blueCube.position.x -= 1;

scene.add(cubeMesh);
scene.add(greenCube);
scene.add(blueCube);

// 3 The Camera

const canvas = document.getElementById('three-canvas');
const camera = new PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight);
scene.add(camera);

camera.position.z = 3;

// 4 The Renderer

const renderer = new WebGLRenderer({canvas: canvas})

renderer.setSize(canvas.clientWidth,canvas.clientHeight, false);
renderer.render(scene,camera);

// Set PixelRatio for Max 2
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//   Responsive Window
window.addEventListener('resize', () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
});

// 5 Animation

// Controls
const subsetOfTHREE = {
  MOUSE,
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp
  }
};

// Controls
CameraControls.install( { THREE: subsetOfTHREE } );
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);

function animate() {
  cubeMesh.rotation.x += 0.01;
  cubeMesh.rotation.z += 0.01;
  greenCube.rotation.x += 0.01;
  greenCube.rotation.z += 0.01;
  blueCube.rotation.x += 0.01;
  blueCube.rotation.z += 0.01;


  const delta = clock.getDelta();
	cameraControls.update( delta );
	renderer.render( scene, camera );
  requestAnimationFrame(animate);
}

animate();