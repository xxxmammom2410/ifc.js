import{
  Scene,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  PerspectiveCamera,
  WebGLRenderer
} from 'three';


// 1 The scene
const scene = new Scene()
  
// 2 The Object
const geometry = new BoxGeometry(0.5,0.5,0.5);
const material = new MeshBasicMaterial({color:'orange'});
const cubeMesh = new Mesh( geometry, material);
scene.add(cubeMesh);

// 3 The Camera
const sizes={
  width:800,
  height:600,
}
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

function animate() {
  cubeMesh.rotation.x += 0.01;
  cubeMesh.rotation.z += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();