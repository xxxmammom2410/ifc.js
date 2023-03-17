import { Matrix4, Vector3,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  Scene, WebGLRenderer,
} from "three";

import { IFCLoader } from "web-ifc-three";

// mapboxgl　mapboxのCDNを読み込むことで生成されるオブジェクト
mapboxgl.accessToken = 'pk.eyJ1IjoiYWtpcmEyNDEwIiwiYSI6ImNsZmFtMml5NDJhY3Qzd29jbG0ydmVzam0ifQ.2ODND2yYjTsho1OE1SIyvQ';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 18.5,
  center: [135.1740102, 34.1875],  // 経度,緯度
  pitch: 60,  // 垂直回転
  bearing: 40,  // 水平回転
  antialias: true
});

// IFC.jsで読み込まれるモデルの座標
const modelOrigin = [135.1744102, 34.1878]; //[経度,緯度]
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, .12, 0]; //[?,水平回転,?]
 
// mapboxのメルカトル座標をモデル座標で設定した緯度、経度、高度で定義
const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
 
const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};
 
const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({
  canvas: map.getCanvas(),
  antialias: true,
});
renderer.autoClear = false;

// mapboxのデータを
const customLayer = {

  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',

  // addLayerされたタイミングで実行
  // IFCモデルをThreeシーンに追加
  onAdd: function () {
    const ifcLoader = new IFCLoader();
    // ifcLoader.ifcManager.setWasmPath( '../../../' );
    ifcLoader.load( '../../../models/_ifc/04.ifc', function ( model ) {
      scene.add( model );
    });

    const directionalLight = new DirectionalLight(0x404040);
    const directionalLight2 = new DirectionalLight(0x404040);
    const ambientLight = new AmbientLight( 0x404040, 3 );

    directionalLight.position.set(0, -70, 100).normalize();
    directionalLight2.position.set(0, 70, 100).normalize();

    scene.add(directionalLight, directionalLight2, ambientLight);
},


// customLayerをレンダリング
  render: function (gl, matrix) {
    const rotationX = new Matrix4().makeRotationAxis(
    new Vector3(1, 0, 0), modelTransform.rotateX);
    const rotationY = new Matrix4().makeRotationAxis(
    new Vector3(0, 1, 0), modelTransform.rotateY);
    const rotationZ = new Matrix4().makeRotationAxis(
    new Vector3(0, 0, 1), modelTransform.rotateZ);
  
    const m = new Matrix4().fromArray(matrix);
    const l = new Matrix4()
    .makeTranslation(
    modelTransform.translateX,
    modelTransform.translateY,
    modelTransform.translateZ
    )
    .scale(
    new Vector3(
    modelTransform.scale,
    -modelTransform.scale,
    modelTransform.scale)
    )
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
    
    camera.projectionMatrix = m.multiply(l);
    renderer.resetState();
    renderer.render(scene, camera);
    map.triggerRepaint();
  }
};
 
map.on('style.load', () => {
  // IFCモデルを読み込むcustomLayerを追加
  map.addLayer(customLayer, 'waterway-label');
});

console.log("hoge")

map.on('load', () => {
// Insert the layer beneath any symbol layer.
// 各レイヤを取得
const layers = map.getStyle().layers;
// シンボルレイヤーでレイアウトがtext-fieldのレイヤのIDを取得
  const labelLayerId = layers.find(
      (layer) => layer.type === 'symbol' && layer.layout['text-field']
  ).id;
  console.log(labelLayerId);

// The 'building' layer in the Mapbox Streets
// vector tileset contains building height data
// from OpenStreetMap.
// グレーボックスで周辺建物のモデルを表示
  map.addLayer(
      {
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',

          // Use an 'interpolate' expression to
          // add a smooth transition effect to
          // the buildings as the user zooms in.
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      },
      labelLayerId
  );
});