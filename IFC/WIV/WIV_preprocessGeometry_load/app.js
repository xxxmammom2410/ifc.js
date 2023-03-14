
import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';

// 変換する対象IFCカテゴリをインポート
import {
  IFCWALL,
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCWINDOW,
  IFCMEMBER,
  IFCPLATE,
  IFCCURTAINWALL,
  IFCDOOR,
  IFCFLOWFITTING,
  IFCFLOWSEGMENT,
  IFCFLOWTERMINAL,
  IFCBUILDINGELEMENTPROXY
} from 'web-ifc';





const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();



// async function loadIfc(event) {
async function loadIfc() {
  importModels('./resources/list.txt');

	// Load properties
	const rawProperties = await fetch('./resources/properties.json.json');
  // 配列ライクなオブジェクトを生成 平坦化されたプロパティ
	properties = await rawProperties.json();

	// Get spatial tree
  // IFCのプロパティをまとめたオブジェクトを生成
  // IFC.getSpatialStructureメソッドよりもキャッシュされたプロパティデータを使用するため高速
	const tree = await constructSpatialTree();
	console.log(tree);

}


async function importModels(textFile){
  const ret = await((await fetch(textFile)).text());
  console.log(typeof(ret));
  const file = new File([ret], 'model_list');
  const reader = new FileReader();

  reader.onload = function(progressEvent){
    var fileContentArray = this.result.split(/\r\n|\n/);
    for(var line = 0; line < fileContentArray.length-1; line++){
      // 1行ずつの処理
      // console.log(line + " --> "+ fileContentArray[line]);
      // モデルの読み込み
      (async function(){await viewer.GLTF.loadModel('./resources/'+fileContentArray[line])})();

    }
  };
  reader.readAsText(file);

}

// Get properties of selected item
// ダブルクリックでエレメントを選択
window.ondblclick = async () => {
	const result = await viewer.IFC.selector.pickIfcItem(true);
  // 選択したエレメントのExpressIDから
	const foundProperties = properties[result.id];
  debugger
  // ExpressIDに対応するPsetをキャッシュされたプロパティデータから取得、
	getPropertySets(foundProperties);
	console.log(foundProperties);
};
// ホバーエフェクト
window.onmousemove = () => viewer.IFC.selector.prePickIfcItem();





// Utils functions
function getFirstItemOfType(type) {
	return Object.values(properties).find(item => item.type === type);
}
function getAllItemsOfType(type) {
	return Object.values(properties).filter(item => item.type === type);
}


// Get spatial tree
async function constructSpatialTree() {
  // 'IFCPROJECT'をカテゴリとするトップレベルの要素をバインド
	const ifcProject = getFirstItemOfType('IFCPROJECT');

	const ifcProjectNode = {
		expressID: ifcProject.expressID,
		type: 'IFCPROJECT',
		children: [],
	};

	const relContained = getAllItemsOfType('IFCRELAGGREGATES');
	const relSpatial = getAllItemsOfType('IFCRELCONTAINEDINSPATIALSTRUCTURE');

	await constructSpatialTreeNode(
		ifcProjectNode,
		relContained,
		relSpatial,
	);

	return ifcProjectNode;

}

// Recursively constructs the spatial tree
async function constructSpatialTreeNode(
	item,
	contains,
	spatials,
) {
	const spatialRels = spatials.filter(
		rel => rel.RelatingStructure === item.expressID,
	);
	const containsRels = contains.filter(
		rel => rel.RelatingObject === item.expressID,
	);

	const spatialRelsIDs = [];
	spatialRels.forEach(rel => spatialRelsIDs.push(...rel.RelatedElements));

	const containsRelsIDs = [];
	containsRels.forEach(rel => containsRelsIDs.push(...rel.RelatedObjects));

	const childrenIDs = [...spatialRelsIDs, ...containsRelsIDs];

	const children = [];
	for (let i = 0; i < childrenIDs.length; i++) {
		const childID = childrenIDs[i];
		const props = properties[childID];
		const child = {
			expressID: props.expressID,
			type: props.type,
			children: [],
		};

		await constructSpatialTreeNode(child, contains, spatials);
		children.push(child);
	}

	item.children = children;
}



// Gets the property sets
function getPropertySets(props) {
	const id = props.expressID;
  //propertiesに含まれる バリューの値を配列で取得
	const propertyValues = Object.values(properties);
  // IfcRelDefinesByPropertiesのIFC要素のみを抽出
	const allPsetsRels = propertyValues.filter(item => item.type === 'IFCRELDEFINESBYPROPERTIES');
  // IfcRelDefinesByProperties要素の中で選択されたエレメントのExpressIDを含むものを抽出
	const relatedPsetsRels = allPsetsRels.filter(item => item.RelatedObjects.includes(id));

  // 選択されたエレメントが参照しているプロパティセットを
  // RelatingPropertyDejifinitionに格納されているExpressIDを元に平坦化されたプロパティから該当する
	const psets = relatedPsetsRels.map(item => properties[item.RelatingPropertyDefinition]);
  console.dir(psets);
  // psetプロパティにHasPropertyプロパティを追加
	for(let pset of psets) {
    // HasProper※iesで参照されているExpressIDを元に平坦化されたIFCプロパティから該当するプロパティを取得した配列を設定
    // ※HasPropertiesにはexpressIDしか格納されていない
		pset.HasProperty = pset.HasProperties.map(id => properties[id]);
	}
  // 選択されたエレメントのプロパティにpsetsを追加
	props.psets = psets;
}





loadIfc();
