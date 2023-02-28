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
import {IFCBUILDINGSTOREY } from "web-ifc";

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
        console.log("HOGE")
        edit();
    },
    false
);



async function edit() {
    const manager = ifcLoader.ifcManager;
    // IFCのクラスを指定してすべてのエレメントのExpressIDを取得
    const storiesIDs = await manager.getAllItemsOfType(0, IFCBUILDINGSTOREY, false);
    // 最初のエレメントExpressIDをバインド
    const storyID = storiesIDs[0];
    // ExpressIDからエレメントを特定
    const story =  await manager.getItemProperties(0, storyID);
		console.log(story);
    console.log("edit()")
    debug=manager;
    console.dir(manager);
    // エレメントのプロパティを書き換え
    story.LongName.value = "Nivel 1 - Editado HOGEHOGE";
    
    Object.defineProperty(story, 'customName', {
      value: "HOGEHOGE",
      writable: false
    });

    // メモリ上にバインドされているIFCモデルも変更する
    manager.ifcAPI.WriteLine(0, story);

    // IFCモデルからblob変換用の設定を作成
    const data = await manager.ifcAPI.ExportFileAsIFC(0);
    const blob = new Blob([data]);
    // blobからファイルを作成
    const file = new File([blob], "modified.ifc");

    const link = document.createElement('a');
    // ダウンロードファイル名を設定
    link.download = 'modified.ifc';
    // ダウンロードリンクをクライアントメモリに作成したURLに設定
    link.href = URL.createObjectURL(file);
    document.body.appendChild(link);
    link.click();
    link.remove();
}


let debug;
console.log("FUGA")
