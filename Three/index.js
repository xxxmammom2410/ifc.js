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
  GridHelper,
  BufferGeometry,
  Line,
  MeshNormalMaterial,
} from 'three';
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";

import CameraControls from 'camera-controls';

import gsap from "gsap";

import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
// 1 The scene
const scene = new Scene()
scene.background= 'red'

let objList = []
  
// 2 The Object

const gridHelper = new GridHelper(10, 10, 'grey', 'grey');
gridHelper.position.y = -0.5
scene.add(gridHelper)

const cube1Color = 'blue'
const cube2Color = 'red'
const cube3Color = 'green'

const geometry = new BoxGeometry( 0.5 );
const bluePhongMaterial = new MeshPhongMaterial({ color: cube1Color });
const redPhongMaterial = new MeshPhongMaterial({ color: cube2Color });
const greenPhongMaterial = new MeshPhongMaterial({ color: cube3Color });

const cube1 = new Mesh(geometry, bluePhongMaterial);
cube1.name = 'Blue Cube'
cube1.position.set(0,1,0);
scene.add(cube1);

const cube2 = new Mesh(geometry, redPhongMaterial);
cube2.position.set(3,1,0);
scene.add(cube2);

const cube3 = new Mesh(geometry, greenPhongMaterial);
cube3.position.set(-3,1,0);
scene.add(cube3);



// const line = new Line(
//   new BufferGeometry().setFromPoints([
//     new Vector3(-9, 1, 0),
//     new Vector3(10, 1, 0),
//   ]),
//   new MeshNormalMaterial()
// );

// scene.add(line)

const loader = new GLTFLoader();

const loadingElem_Spinner = document.querySelector('#loader-container');
const loadingText = loadingElem_Spinner.querySelector('p');

let gltfScene;
loader.load('./resources/southern_district_police_station.glb',
// onLoadコールバック
(gltf) => {
  loadingElem_Spinner.style.display = 'none';
  console.log(gltf)
  scene.add(gltf.scene);
  gltfScene = gltf.scene;
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
  scene.add(cube);
  gui.add(cube.position,'y',-10,10,0.1).name("cube Y-axis")
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

const blue = 0x000099;
const green = 0x009900;
const red = 0x990000;


// Helper Object
const objectsToTest = { 
  [cube1.uuid]: {object: cube1, color: blue},
  [cube2.uuid]: {object: cube2, color: red},
  [cube3.uuid]: {object: cube3, color: green}
};

const objectsArray = Object.values(objectsToTest).map(item => item.object);

//raycaster
const raycaster = new Raycaster();
const mouse = new Vector2();
let previousSelectedUuid;

window.addEventListener('mousemove', (event) => {
  mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
  // canvasの座標は下向きが正
	mouse.y = - (event.clientY / canvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera)
  
  const intersects = raycaster.intersectObjects(objectsArray);
  if (!intersects.length) {
    resetPreviousSelection();
    return;
  };
  
  const firstIntersection = intersects[0];
  firstIntersection.object.material.color.set('orange');

  const isNotPrevious = previousSelectedUuid !==firstIntersection.object.uuid;
  if (previousSelectedUuid !== undefined && isNotPrevious) {
    resetPreviousSelection();
  }

  previousSelectedUuid = firstIntersection.object.uuid;
})

function resetPreviousSelection() {
  if(previousSelectedUuid === undefined) return;
  const previousSelected = objectsToTest[previousSelectedUuid];
  previousSelected.object.material.color.set(previousSelected.color);
}


window.addEventListener('dblclick', (event) => {
	mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
	mouse.y = - (event.clientY / canvas.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse,camera);
  const intersects = raycaster.intersectObject(gltfScene);

  if(!intersects.length){
    return;
  }

  const firstIntersection = intersects[0];
  const location = firstIntersection.point;

  const result = window.prompt("Introduce message");

  const base = document.createElement('div');
  base.className = 'base-label';

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.className = 'delete-button hidden';
  base.appendChild(deleteButton);

  base.onmouseenter = () => deleteButton.classList.remove('hidden');
  base.onmouseleave = () => deleteButton.classList.add('hidden');

const postit = document.createElement('div');
postit.className = 'label';
postit.textContent = result;
base.appendChild(postit);

const ifcJsTitle = new CSS2DObject(base);
ifcJsTitle.position.copy(location);
scene.add(ifcJsTitle);

deleteButton.onclick = () => {
  base.remove();
  ifcJsTitle.element = null;
  ifcJsTitle.removeFromParent();
}
})
// 3 The Camera

const canvas = document.getElementById('three-canvas');
const camera = new PerspectiveCamera(75, canvas.clientWidth/canvas.clientHeight);
scene.add(camera);

camera.position.z = 3;

// 4 The Renderer

const renderer = new WebGLRenderer({canvas: canvas})

renderer.setClearColor(0xffffff, 0.5);
renderer.setSize(canvas.clientWidth,canvas.clientHeight, false);
renderer.render(scene,camera);

// Set PixelRatio for Max 2
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//  Set up 2d renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.top = '0px';
document.body.appendChild( labelRenderer.domElement );

//   Responsive Window
window.addEventListener("resize", () => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
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
  labelRenderer.render(scene,camera);
  requestAnimationFrame(animate);
}

animate();



// 6 Debug

// Mock Animation
const functionParam = {
  spin: () => {
    gsap.to(greenCube.rotation,{ y: greenCube.rotation.y +10, duration:1});
  },
  spin2: () => {
    gsap.to(greenCube.rotation,{ z: greenCube.rotation.z +10, duration:1});
  }
}

// GUI
const gui = new GUI();

gui.add(greenCube.position, 'y', -10,10,0.1)
gui.add(greenCube.position, 'z').min(-10).max(10).step(0.1).name('Z-axis');
gui.add(greenCube, 'visible').name('GreenCube visibility');
gui.addFolder('Light2').add(material_green, "wireframe").name("Wireframe");

gui.add(mesh.position,'y',-10,10,0.1).name('mesh Y-axis')
const colorParam = {
	design: 0xff0000	
}

//セッターでパラメータ変更が必要な場合はラッパー関数を作成する
gui.addColor(colorParam, 'design').onChange(() => {
	greenCube.material.color.set(colorParam.design);
})


gui.add(functionParam, 'spin');
gui.add(functionParam, 'spin2');

greenCube.name="green Cube"
blueCube.name="blue Cube"
cube2.name = "cube2"
cube3.name = "cube3"
const intersect = raycaster.intersectObject(cube1);
console.log(intersect)
const intersects = raycaster.intersectObjects([cube1, cube2, cube3 ,greenCube ,blueCube])
console.log(intersects)
