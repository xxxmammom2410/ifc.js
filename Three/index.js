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

const camera = new PerspectiveCamera(75, sizes.width/sizes.height);
scene.add(camera);

camera.position.z = 3;

// 4 The Renderer
const canvas = document.getElementById('three-canvas');
const renderer = new WebGLRenderer({canvas: canvas})

renderer.setSize(sizes.width,sizes.height);
renderer.render(scene,camera);

// 5 Animation

function animate() {
  cubeMesh.rotation.x += 0.01;
  cubeMesh.rotation.z += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();