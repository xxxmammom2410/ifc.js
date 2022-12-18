import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { Plane, Vector3 } from 'three';
import { PlaneGeometry, MeshPhongMaterial, Mesh } from 'three';
const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });


// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
  // Load the model
  // const model = await viewer.IFC.loadIfcUrl(url);

  // Add dropped shadow and post-processing efect
  // await viewer.shadowDropper.renderShadow(model.modelID);
  await viewer.GLTF.load('../../../models/_glb/imose_sekisitu2.glb');
  // viewer.context.renderer.postProduction.active = true;
}

loadIfc('../../../models/_ifc/04.ifc');

viewer.dimensions.active = true;
viewer.dimensions.previewActive = true;

// window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
// window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

window.ondblclick = async () => {
  await viewer.dimensions.create();
}



window.onkeydown = (event) => {
  if (event.code === "Space") {
    console.log("Space");
    plane.normal.x = -(plane.normal.x);
  }else if (event.code === "KeyP") {
    console.log("Clipping");
    viewer.IFC.context.renderer.renderer.clippingPlanes.push(plane)
    // console.log(viewer.clipper.active);
  }else if (event.code === 'KeyX') {
    console.log("delete");
    viewer.dimensions.delete();
  };
};
// viewer.clipper.createPlane();
// const clipper = new IfcPlane()

let plane = new Plane(new Vector3(1, 0, 0), 0);

console.log("test");

