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

input.addEventListener(
    "change",
    async (changed) => {
        const ifcURL = URL.createObjectURL(changed.target.files[0]);
        const model = await ifcLoader.loadAsync(ifcURL);
        scene.add(model);
        // getSpatialStructureでツリー情報をオブジェクトの形で取得する
        const ifcProject = await ifcLoader.ifcManager.getSpatialStructure(model.modelID);
        createTreeMenu(ifcProject) ;
      },
    false
);


  // Tree view
  

// Spatial tree menu

function createTreeMenu(ifcProject) {
  const root = document.getElementById("tree-root");
  removeAllChildren(root);
  // root以下にifcProjectオブジェクトを元にDOMを追加する
  const ifcProjectNode = createNestedChild(root, ifcProject);
  // childrenプロパティ全てに対してconstructTreeMenuNode()を実行
  ifcProject.children.forEach(child => {
      constructTreeMenuNode(ifcProjectNode, child);
  })
}

function nodeToString(node) {
  return `${node.type} - ${node.expressID}`
}

// 再帰関数でツリーの子要素がなくなるまでDOM要素を追加
function constructTreeMenuNode(parent, node) {
  const children = node.children;
  if (children.length === 0) {
      createSimpleChild(parent, node);
      return;
  }
  const nodeElement = createNestedChild(parent, node);
  children.forEach(child => {
    
      constructTreeMenuNode(nodeElement, child);
  })
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement('li');
  createTitle(root, content);
  const childrenContainer = document.createElement('ul');
  childrenContainer.classList.add("nested");
  root.appendChild(childrenContainer);
  parent.appendChild(root);
  return childrenContainer;
}

function createTitle(parent, content) {
  const title = document.createElement("span");
  title.classList.add("caret");
  title.onclick = () => {
      title.parentElement.querySelector(".nested").classList.toggle("active");
      title.classList.toggle("caret-down");
  }
  title.textContent = content;
  parent.appendChild(title);
}

function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement('li');
  childNode.classList.add('leaf-node');
  childNode.textContent = content;
  parent.appendChild(childNode);

  childNode.onmouseenter = () => {
      // ifcLoader.ifcManager.getItemProperties(0, [node.expressID]);
  }

  childNode.onclick = async () => {
    console.log(node.expressID);
     const prop = await ifcLoader.ifcManager.getItemProperties(0, Number([node.expressID]));
     console.log(prop);
  }
}

function removeAllChildren(element) {
  while (element.firstChild) {
      element.removeChild(element.firstChild);
  }
}