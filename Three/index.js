import {
  Scene,
  BoxGeometry,
  SphereGeometry,
  MeshBasicMaterial,
  MeshPhongMaterial,
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
  Clock,
  DirectionalLight,
  TextureLoader,
  LoadingManager,
  AmbientLight,
  SpotLight,
  Object3D,
  Shape,
  ExtrudeGeometry,
  BoxBufferGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  WireframeGeometry,
  Points,
  PointsMaterial,
} from 'three';
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

import CameraControls from 'camera-controls';

import gsap from "gsap";

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
// 1 The scene
const scene = new Scene()
  
// 2 The Object

const loader = new GLTFLoader();

const loadingElem_Spinner = document.querySelector('#loader-container');
const loadingText = loadingElem_Spinner.querySelector('p');

loader.load('./resources/southern_district_police_station.glb',
// onLoadコールバック
(gltf) => {
  loadingElem_Spinner.style.display = 'none';
  console.log(gltf)
  scene.add(gltf.scene);
},

// onProgressコールバック
(progress) => {
  const current = (progress.loaded/progress.total) *100;
  const formatted = Math.trunc(current * 100) /100;
  loadingText.textContent = `Loading: ${formatted}`;

},
// onErrorコールバック
(error) => {
  console.log('An error happend:',error);
}
);

const geometry = new BoxGeometry(0.5);


//Loading Manager
const loadingManager = new LoadingManager();
const loadingElem = document.querySelector('#loading');
const progressBar = loadingElem.querySelector('.progressbar');

const images = [];
for (let i = 0; i < 6; i++) {
  images.push(`https://picsum.photos/200/300?random=${i}`);
}

const textureLoader = new TextureLoader(loadingManager);

const materials = [
  new MeshBasicMaterial({map:textureLoader.load(images[0],()=>{console.log("HOGEHOGE")})}),
  new MeshBasicMaterial({map:textureLoader.load(images[1])}),
  new MeshBasicMaterial({map:textureLoader.load(images[2])}),
  new MeshBasicMaterial({map:textureLoader.load(images[3])}),
  new MeshBasicMaterial({map:textureLoader.load(images[4])}),
  new MeshBasicMaterial({map:textureLoader.load(images[5])}),
]

loadingManager.onLoad = () => {
  console.log("LOADED!!")
  loadingElem.style.display = 'none';
  const cube = new Mesh(geometry, materials);
  // scene.add(cube);
}

loadingManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
  const progress = itemsLoaded / itemsTotal;
  progressBar.style.transform = `scaleX(${progress})`;
};


const material_green = new MeshBasicMaterial({color:0x00ff00, wireframe:true});
const material_blue = new MeshPhongMaterial({color:0x0000ff});

const greenCube = new Mesh( geometry, material_green);
const blueCube = new Mesh( geometry, material_blue);

greenCube.position.x += 1;
blueCube.position.x -= 1;

scene.add(greenCube);
scene.add(blueCube);

const cubeLength = 1; 
const cubeWidth = 1;


// ワイヤーフレーム
const material = new MeshPhongMaterial( {
  color: 0xff00f0,
  polygonOffset: true,
  polygonOffsetFactor: 1, 
  polygonOffsetUnits: 1
} );
const mesh = new Mesh( geometry, material );
scene.add( mesh )

const mat = new LineBasicMaterial( { color: 0x00ffff } );
const wireGeo = new WireframeGeometry(mesh.geometry);
const wireframe = new LineSegments(wireGeo, mat);
scene.add(wireframe);


// Pointsメッシュ
const radius = 7;
const widthSegments = 12;
const heightSegments = 8;
const p_geometry = new SphereGeometry(radius, widthSegments, heightSegments);

const p_material = new PointsMaterial({
	color: 'red',
	size: 20, // in world units
  sizeAttenuation:false,
});

const points = new Points(p_geometry, p_material);
points.position.set(0,1,0)
scene.add(points);




//Light
let light = new DirectionalLight(0xffffff);
light.position.set(0,1,1);
scene.add(light);

const color = 0xFFFFFF;
const intensity = 1;
const spotlight = new SpotLight(color, intensity,8,1.2,1);
scene.add(spotlight);
scene.add(spotlight.target)


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

// Mock Animation
const functionParam = {
  spin: () => {
    gsap.to(greenCube.rotation,{ y: greenCube.rotation.y +10, duration:1});
  },
  spin2: () => {
    gsap.to(greenCube.rotation,{ z: greenCube.rotation.z +10, duration:1});
  }
}

// 6 Debug
const gui = new GUI();

gui.add(greenCube.position, 'y', -10,10,0.1)
gui.add(greenCube.position, 'z').min(-10).max(10).step(0.1).name('Z-axis');
gui.add(greenCube, 'visible').name('GreenCube visibility');
gui.addFolder('Light2').add(material_green, "wireframe").name("Wireframe");

const colorParam = {
	design: 0xff0000	
}

//セッターでパラメータ変更が必要な場合はラッパー関数を作成する
gui.addColor(colorParam, 'design').onChange(() => {
	greenCube.material.color.set(colorParam.design);
})


gui.add(functionParam, 'spin');
gui.add(functionParam, 'spin2');
