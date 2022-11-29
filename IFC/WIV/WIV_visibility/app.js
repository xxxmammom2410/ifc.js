import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

import {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER,
} from 'web-ifc';






const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });
const scene = viewer.context.getScene();

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
  // Load the model
  const model = await viewer.IFC.loadIfcUrl(url);
  // サブセットで別途作成するため、元のモデルは削除
  model.removeFromParent()
  // Add dropped shadow and post-processing efect
  await viewer.shadowDropper.renderShadow(model.modelID);
  viewer.context.renderer.postProduction.active = true;

  setupAllCategories();
}

loadIfc('../../../models/_ifc/02.ifc');

// Enum型でリストを定義
// List of categories names
const categories = {
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCFURNISHINGELEMENT,
  IFCDOOR,
  IFCWINDOW,
  IFCPLATE,
  IFCMEMBER,
};
console.log("categories_item: " + IFCSLAB);
console.dir(categories);

 

// Gets the IDs of all the items of a specific category
async function getAll(category) {
  return viewer.IFC.loader.ifcManager.getAllItemsOfType(0, category, false);
}

// Creates a new subset containing all elements of a category
// categoryに属する全てのオブジェクトを一つのsubsetで新規作成
async function newSubsetOfType(category) {
  const ids = await getAll(category);
  return viewer.IFC.loader.ifcManager.createSubset({
    modelID: 0,
    scene,
    ids,
    removePrevious: true,
    customID: category.toString()
  })
}

// Stores the created subsets
const subsets = {};

async function setupAllCategories() {
  const allCategories = Object.values(categories);
  for (let i = 0; i < allCategories.length; i++) {
    // category は int
    const category = allCategories[i];
    await setupCategory(category);
  }
}    
async function setupCategory(category) {
  // subsetのcustomIDで命名して登録
  subsets[category] = await newSubsetOfType(category);
  setupCheckBox(category);
}

// Gets the name of category
// category(組み込みのマジックナンバー)によりcategoriesでマップされたカテゴリ名を取得
function getName(category) {
  const names = Object.keys(categories);
  //引数に与えられたcategoryがcategoriesのvalueに含まれているものを返却する
  return names.find(name => categories[name] === category)
}

// sets up the checkbox event to hide / show elements
function setupCheckBox(category) {
  const name = getName(category);
  // カテゴリ名からid名をあらかじめ一致させておいたinput要素を取得
  const checkBox = document.getElementById(name);
  checkBox.addEventListener('change', (event) => {
    
    const checked = event.target.checked;
    const subset = subsets[category];
    if (checked) scene.add(subset);
    else subset.removeFromParent();
  });
}

