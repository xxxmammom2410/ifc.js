import { Matrix4, Vector3,
  PerspectiveCamera,
  Scene, WebGLRenderer,
} from "three";

// mapboxgl CDNでmapboxのスクリプトから生成される
console.log(mapboxgl);
mapboxgl.accessToken = 'pk.eyJ1IjoiYWtpcmEyNDEwIiwiYSI6ImNsZmFtMml5NDJhY3Qzd29jbG0ydmVzam0ifQ.2ODND2yYjTsho1OE1SIyvQ';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 18.5,
  center: [135.1740102, 34.1875],
  pitch: 60,
  bearing: 40,
  antialias: true
});
// 経度->緯度
const modelOrigin = [135.1740102, 34.1875];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, .72, 0];
 
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

const customLayer = {

  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',

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
  map.addLayer(customLayer, 'waterway-label');
});