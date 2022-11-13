import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { IFCLoader } from "web-ifc-three/IFCLoader";

import { Raycaster,Vector2 } from "three";
import { acceleratedRaycast,computeBoundsTree,disposeBoundsTree } from "three-mesh-bvh";

const input = document.getElementById("file-input");


//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 2);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({ canvas: threeCanvas, alpha: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//raycast
const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function cast(event){
  // Computes the position of the mouse on the screen
  // threeCanvasが全画面でない場合を対処
  const bounds = threeCanvas.getBoundingClientRect();

  const x1 = event.clientX - bounds.left;
  const x2 = bounds.right - bounds.left;
  mouse.x = (x1/x2) * 2 - 1;

  const y1 = event.clientY - bounds.top;
  const y2 = bounds.bottom - bounds.top;
  mouse.y = -(y1/y2)* 2 + 1;

  // places it on the camera pointing to the mouse
  raycaster.setFromCamera(mouse,camera);

  // Casts a ray
  return raycaster.intersectObjects(ifcModels);

}

function pick(event){
  const found = cast(event)[0];
  if (found) {
  // threeのレイキャストで取得したfaceIndexをifcのgeometryから検索し、ifcモデルのindexを取得する
   const index = found.faceIndex ;
   const geometry = found.object.geometry;
   const id = ifcLoader.ifcManager.getExpressId(geometry,index);
   console.log(id);
  }
}

// threeのcanvas上をダブルクリックでレイキャスト発射
threeCanvas.ondblclick = (event) => pick(event);

//Animation loop
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
  (size.width = window.innerWidth), (size.height = window.innerHeight);
  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
  renderer.setSize(size.width, size.height);
});

const ifcLoader = new IFCLoader();
// Sets up optimized picking
ifcLoader.ifcManager.setupThreeMeshBVH(computeBoundsTree,disposeBoundsTree,acceleratedRaycast);

const ifcModels = [];

input.addEventListener(
    "change",
    async (changed) => {
        const ifcURL = URL.createObjectURL(changed.target.files[0]);
        const model = await ifcLoader.loadAsync(ifcURL);
        scene.add(model);
        console.log(model);
        // threeのraycast用のarrayに追加
        ifcModels.push(model);
    },
    false
);