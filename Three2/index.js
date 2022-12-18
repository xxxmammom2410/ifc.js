import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import {
    CSS2DRenderer,
    CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer'

const scene = new THREE.Scene()

const light = new THREE.SpotLight()
light.position.set(12.5, 12.5, 12.5)
// light.castShadow = true
// light.shadow.mapSize.width = 1024
// light.shadow.mapSize.height = 1024
scene.add(light)

let sunlight = new THREE.DirectionalLight(0xffffff);
sunlight.position.set(0,1,1);
scene.add(sunlight);

const hemilight = new THREE.HemisphereLight(0x888888, 0xbd8b40, 1.0);
scene.add(hemilight);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(15, 15, 15)

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

const pickableObjects = []

const loader = new GLTFLoader()
loader.load(
    '../models/_glb/imose_sekisitu2.glb',
    function (gltf) {
        gltf.scene.traverse(function (child) {
            if ((child).isMesh) {
                const m = child 
                switch (m.name) {
                    case 'Plane':
                        m.receiveShadow = true
                        break
                    default:
                        m.castShadow = true
                }
                pickableObjects.push(m)
            }
        })
        scene.add(gltf.scene)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    labelRenderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

let ctrlDown = false
let lineId = 0
let line
let drawingLine = false
const measurementLabels = {}

window.addEventListener('keydown', function (event) {
    if (event.key === 'Shift') {
        ctrlDown = true
        controls.enabled = false
        renderer.domElement.style.cursor = 'crosshair'
    }
})

window.addEventListener('keyup', function (event) {
    if (event.key === 'Shift') {
        ctrlDown = false
        controls.enabled = true
        renderer.domElement.style.cursor = 'pointer'
        if (drawingLine) {
            //delete the last line because it wasn't committed
            scene.remove(line)
            scene.remove(measurementLabels[lineId])
            drawingLine = false
        }
    }
})

const raycaster = new THREE.Raycaster()
let intersects
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener('pointerdown', onClick, false)
function onClick() {
    if (ctrlDown) {
        raycaster.setFromCamera(mouse, camera)
        intersects = raycaster.intersectObjects(pickableObjects, false)
        if (renderer.clippingPlanes.length > 0) {  
          intersects = intersects.filter(function(elem) {  
            return renderer.clippingPlanes.every(function(elem2) {  
              return elem2.distanceToPoint(elem.point) > 0;  
            });  
          });  
        }
        if (intersects.length > 0) {
            if (!drawingLine) {
                //start the line
                const points = []
                points.push(intersects[0].point)
                points.push(intersects[0].point.clone())
                const geometry = new THREE.BufferGeometry().setFromPoints(
                    points
                )
                line = new THREE.LineSegments(
                    geometry,
                    new THREE.LineBasicMaterial({
                        color: 0xff0000,
                        transparent: false,
                        opacity: 0.75,
                        linewidth:40,
                        // depthTest: false,
                        // depthWrite: false
                    })
                )
                line.frustumCulled = false
                scene.add(line)

                const measurementDiv = document.createElement(
                    'div'
                ) 
                measurementDiv.className = 'measurementLabel'
                measurementDiv.innerText = '0.0m'
                const measurementLabel = new CSS2DObject(measurementDiv)
                measurementLabel.position.copy(intersects[0].point)
                measurementLabels[lineId] = measurementLabel
                scene.add(measurementLabels[lineId])
                drawingLine = true
            } else {
                //finish the line
                const positions = line.geometry.attributes.position
                    .array 
                positions[3] = intersects[0].point.x
                positions[4] = intersects[0].point.y
                positions[5] = intersects[0].point.z
                line.geometry.attributes.position.needsUpdate = true
                lineId++
                drawingLine = false
            }
        }
    }
}

document.addEventListener('mousemove', onDocumentMouseMove, false)
function onDocumentMouseMove(event) {
    event.preventDefault()

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    if (drawingLine) {
        raycaster.setFromCamera(mouse, camera)
        intersects = raycaster.intersectObjects(pickableObjects, false)
        if (intersects.length > 0) {
            const positions = line.geometry.attributes.position
                .array 
            const v0 = new THREE.Vector3(
                positions[0],
                positions[1],
                positions[2]
            )
            const v1 = new THREE.Vector3(
                intersects[0].point.x,
                intersects[0].point.y,
                intersects[0].point.z
            )
            positions[3] = intersects[0].point.x
            positions[4] = intersects[0].point.y
            positions[5] = intersects[0].point.z
            line.geometry.attributes.position.needsUpdate = true
            const distance = v0.distanceTo(v1)
            measurementLabels[lineId].element.innerText =
                distance.toFixed(2) + 'm'
            measurementLabels[lineId].position.lerpVectors(v0, v1, 0.5)
        }
    }
}

const stats = Stats()
document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    render()

    stats.update()
}

function render() {
    labelRenderer.render(scene, camera)
    renderer.render(scene, camera)
}

animate()


window.onkeydown = (event) => {
  if (event.code === "Space") {
    console.log("Space");
    plane.normal.x = -(plane.normal.x);
  }else if (event.code === "KeyP") {
    console.log("Clipping");
    renderer.clippingPlanes.push(plane)
    // console.log(viewer.clipper.active);
  }else if (event.code === 'KeyX') {
    console.log("delete");
    // viewer.dimensions.delete();
  };
};


let plane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);