import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
		// Load the model
    const model = await viewer.IFC.loadIfcUrl(url);

		// Add dropped shadow and post-processing efect
    await viewer.shadowDropper.renderShadow(model.modelID);
    viewer.context.renderer.postProduction.active = true;
}

loadIfc('../../../models/_ifc/04.ifc');

viewer.dimensions.active = true;
viewer.dimensions.previewActive = true;

// window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
// window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

window.ondblclick = async () => {
  await viewer.dimensions.create();
}

window.onkeydown = async (event) => {
  if(event.code === 'KeyX'){
    await viewer.dimensions.delete();
  };
}