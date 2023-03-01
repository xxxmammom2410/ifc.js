import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { LineBasicMaterial, MeshBasicMaterial } from 'three';

import Drawing from 'dxf-writer';
const container = document.getElementById('viewer-container');
const viewer = new IfcViewerAPI({ container, backgroundColor: new Color(0xffffff) });

// Create grid and axes
viewer.grid.setGrid();
viewer.axes.setAxes();

async function loadIfc(url) {
  // Load the model
  const model = await viewer.IFC.loadIfcUrl(url);


  // Setup camera controls
  const controls = viewer.context.ifcCamera.cameraControls;
  controls.setPosition(7.6, 4.3, 24.8, false);
  controls.setTarget(-7.1, -0.3, 2.5, false);

  // Generate all plans
  //すべてのフロアエレメントを元にIfcPlaneを作成しplanListsに格納
  await viewer.plans.computeAllPlanViews(model.modelID);

  // plan用のマテリアルを作成
  const lineMaterial = new LineBasicMaterial({ color: 'black' });
  const baseMaterial = new MeshBasicMaterial({
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1,
  });
  // plan表示用メッシュを作成
  await viewer.edges.create('example', model.modelID, lineMaterial, baseMaterial);

  // Floor plan viewing
  // 作成したifcPlaneのExpressIDのリストを取得
  const allPlans = viewer.plans.getAll(model.modelID);
  console.log("allPlans~~~")
  console.dir(allPlans);

  const container = document.getElementById('button-container');

  for (const plan of allPlans) {
    // ExpressIDからPlan用のIfcPlaneを取得
    const currentPlan = viewer.plans.planLists[model.modelID][plan];
    console.log("plan~~~")
    console.dir(plan);
    console.log(currentPlan);

    const button = document.createElement('button');
    container.appendChild(button);
    button.textContent = currentPlan.name;
    button.onclick = () => {
      // orthoカメラに変更
      viewer.plans.goTo(model.modelID, plan, true);
      // plan表示用メッシュを有効に
      viewer.edges.toggle('example', true);
    };
  }

  const button = document.createElement('button');
  container.appendChild(button);
  button.textContent = 'Exit';
  button.onclick = () => {
    // 元のカメラに戻す
    viewer.plans.exitPlanView();
    // plan表示用メッシュを無効に 
    viewer.edges.toggle('example', false);
  };


  //---------- Floor plan export ----------
  viewer.dxf.initializeJSDXF(Drawing);

  const ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
  // 各階リストを取得
  const storeys = ifcProject.children[0].children[0].children;

  // 階層の平坦化処理
  for (let storey of storeys) {
    // 各階にあるエレメントについての処理
    for (let child of storey.children) {
      // もし各エレメントがさらに子要素を持っていたら
      if (child.children.length) {
        // 各階の配列に子要素を追加
        storey.children.push(...child.children);
      }
    }
  }

  // 平面図書き出しボタンのイベントバインド処理
  for (const plan of allPlans) {
    const currentPlan = viewer.plans.planLists[model.modelID][plan];
    console.log(currentPlan);

    const button = document.createElement('button');
    container.appendChild(button);
    button.textContent = 'Export ' + currentPlan.name;
    // ボタンクリックイベントをバインド
    button.onclick = () => {
      // storeyのexpressIDとplanのexpressIDが一致するものを取得
      const storey = storeys.find(storey => storey.expressID === currentPlan.expressID);
      // 投影されたメッシュを描画する
      drawProjectedItems(storey, currentPlan, model.modelID);
    };
  }


  const dummySubsetMat = new MeshBasicMaterial({ visible: false });

  async function drawProjectedItems(storey, plan, modelID) {

    // Create a new drawing (if it doesn't exist)
    // dxf-writerで
    if (!viewer.dxf.drawings[plan.name]) viewer.dxf.newDrawing(plan.name);

    // Get the IDs of all the items to draw
    // 各階にある全てのエレメントのexpressIDを格納
    const ids = storey.children.map(item => item.expressID);

    // If no items to draw in this layer in this floor plan, let's continue
    if (!ids.length) return;

    // If there are items, extract its geometry
    // 平面図描画用の各階のエレメントをまとめるバッファ用サブセットを作成
    const subset = viewer.IFC.loader.ifcManager.createSubset({
      modelID,
      ids,
      removePrevious: true,
      customID: 'floor_plan_generation',
      material: dummySubsetMat,
    });

    // Get the projection of the items in this floor plan
    const filteredPoints = [];
    // three.jsライブラリを利用して断面線を抽出
    // Source: https://github.com/gkjohnson/three-mesh-bvh/blob/master/example/edgeProjection.js
    const edges = await viewer.edgesProjector.projectEdges(subset);//:LineSegments

    // 断面線の見た目処理

    const positions = edges.geometry.attributes.position.array;
    // Lines shorter than this won't be rendered
    const tolerance = 0.01;
    for (let i = 0; i < positions.length - 5; i += 6) {

      const a = positions[i] - positions[i + 3];
      // Z coords are multiplied by -1 to match DXF Y coordinate
      const b = -positions[i + 2] + positions[i + 5];

      const distance = Math.sqrt(a * a + b * b);

      // 描画する点のみ配列に格納
      if (distance > tolerance) {
        filteredPoints.push([positions[i], -positions[i + 2], positions[i + 3], -positions[i + 5]]);
      }

    }

    // Draw the projection of the items
        // Source: https://gkjohnson.github.io/three-mesh-bvh/example/bundle/clippedEdges.html
    viewer.dxf.drawEdges(plan.name, filteredPoints, 'Projection', Drawing.ACI.BLUE, 'CONTINUOUS');

    // Clean up
    edges.geometry.dispose();


    // Draw all sectioned items. thick and thin are the default layers created by IFC.js
    viewer.dxf.drawNamedLayer(plan.name, plan, 'thick', 'Section', Drawing.ACI.RED, 'CONTINUOUS');
    viewer.dxf.drawNamedLayer(plan.name, plan, 'thin', 'Section_Secondary', Drawing.ACI.CYAN, 'CONTINUOUS');

    // Download the generated floorplan
    const result = viewer.dxf.exportDXF(plan.name);
    const link = document.createElement('a');
    link.download = 'floorplan.dxf';
    link.href = URL.createObjectURL(result);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }


}




loadIfc('../../../models/_ifc/04.ifc');
