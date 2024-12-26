// import * as THREE from "three";
// import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
controls.target.set(0, 0, -4);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb,
  metalness: 0.5,
  roughness: 0.3,
  side: THREE.DoubleSide,
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.set(0, 0.7, 0);
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const axesHelper = new THREE.AxesHelper(60);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(50, 50);
scene.add(gridHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(50, 100, -50);
directionalLight.castShadow = true;
scene.add(directionalLight);

const skyColor = new THREE.Color(0x87ceeb);
scene.background = skyColor;

const loader = new GLTFLoader().setPath("titanic/");
loader.load(
  "scene.gltf",
  (gltf) => {
    console.log("loading model");
    const mesh = gltf.scene;

    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const offsetY = size.y / 2 - box.min.y;

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 78 / maxDim;
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(-center.x * scale, offsetY * scale, -center.z * scale);

    mesh.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
      }
    });

    scene.add(mesh);

    const cameraDistance = maxDim * 2.5;
    camera.position.set(0, maxDim * 1.5, cameraDistance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    console.log("Model added to scene");

    document.getElementById("progress-container").style.display = "none";
  },
  (xhr) => {
    console.log(`loading ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error(error);
  }
);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
