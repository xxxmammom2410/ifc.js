import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { LineBasicMaterial, MeshBasicMaterial } from 'three';
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

  console.log("END")
}

loadIfc('../../../models/_ifc/04.ifc');
