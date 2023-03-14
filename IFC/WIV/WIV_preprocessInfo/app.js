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

  // Serialize properties
  const result = await viewer.IFC.properties.serializeAllProperties(model);

  // Download the properties as JSON file
  const file = new File(result, 'properties');

  const link = document.createElement('a');
  document.body.appendChild(link);
  link.href = URL.createObjectURL(file);
  link.download = 'properties.json';
  link.click();
  link.remove();
}


loadIfc('../../../models/_ifc/04.ifc');