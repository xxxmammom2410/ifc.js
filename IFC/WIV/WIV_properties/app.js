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

// window.ondblclick = async () => await viewer.IFC.selector.pickIfcItem();
window.onmousemove = async () => await viewer.IFC.selector.prePickIfcItem();

window.ondblclick = async () => {
  // const result = await viewer.IFC.selector.highlightIfcItem();
  const result = await viewer.IFC.selector.pickIfcItem();
  if (!result) return;
  const { modelID, id } = result;
  const props = await viewer.IFC.getProperties(modelID, id, true, false);
  console.log(props);
  createPropertiesMenu(props)
};

const propsGUI = document.getElementById("ifc-property-menu-root");

function createPropertiesMenu(properties) {
    console.log(properties);

    removeAllChildren(propsGUI);

    // delete properties.psets;
    // delete properties.mats;
    // delete properties.type;


    for (let key in properties) {
        createPropertyEntry(key, properties[key]);
    }

}

function createPropertyEntry(key, value) {
    const propContainer = document.createElement("div");
    propContainer.classList.add("ifc-property-item");

    if(value === null || value === undefined) value = "undefined";
    else if(value.value) value = value.value;

    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    propContainer.appendChild(keyElement);

    const valueElement = document.createElement("div");
    valueElement.classList.add("ifc-property-value");
    valueElement.textContent = value;
    propContainer.appendChild(valueElement);

    propsGUI.appendChild(propContainer);
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}