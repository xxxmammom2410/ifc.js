import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();


const input = document.getElementById("file-input");


// const ifcLoader = new IFCLoader();
input.addEventListener(
  "change",
  async (changed) => {
    // Load the model
    const ifcURL = URL.createObjectURL(changed.target.files[0]);
    const model = await viewer.IFC.loadIfcUrl(ifcURL);

    // Add dropped shadow and post-processing efect
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;

    // const ifcURL = URL.createObjectURL(changed.target.files[0]);
    // const model = await ifcLoader.loadAsync(ifcURL);
    // scene.add(model);
  },
  false
);

// async function loadIfc(url) {
//   // Load the model
//   const model = await viewer.IFC.loadIfcUrl(url);

//   // Add dropped shadow and post-processing efect
//   await viewer.shadowDropper.renderShadow(model.modelID);
//   viewer.context.renderer.postProduction.active = true;
// }

// loadIfc('../../../models/_ifc/04.ifc');

async function setUpMultiThreading() {
  const manager = viewer.IFC.loader.ifcManager;
  // these paths depend on how you structure your project
  await manager.useWebWorkers(true, './IFCWorker.js');
}

setUpMultiThreading();

function setupProgressNotification() {
  const text = document.getElementById('progress-text');
  viewer.IFC.loader.ifcManager.setOnProgress((event) => {
    const percent = event.loaded / event.total * 100;
      const result = Math.trunc(percent);
      text.innerText = result.toString();
  });
}

setupProgressNotification();