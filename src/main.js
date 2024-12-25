import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

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
// camera.position.set(4, 5, 11);

// camera.position.set(0, 50, 100); // Move the camera back to see larger objects
// camera.far = 5000; // Increase the far clipping plane
// camera.updateProjectionMatrix();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 5;
controls.maxDistance = 30;
controls.minPolarAngle = 0.5;
controls.maxPolarAngle = 1.5;
controls.autoRotate = false;
// controls.target = new THREE.Vector3(0, 1, 0);
controls.target.set(0, 1, -4);
controls.update();

const groundGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);
// const groundMaterial = new THREE.MeshStandardMaterial({
//   color: 0x555555,
//   side: THREE.DoubleSide
// });

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x87ceeb, // Light blue for ocean
  metalness: 0.5, // Reflective like water
  roughness: 0.3, // Smooth surface
  side: THREE.DoubleSide,
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true;
groundMesh.position.set(0, 0.5, 0); // Adjust 0.5 as needed
scene.add(groundMesh);

const spotLight = new THREE.SpotLight(0xffffff, 3000, 100, 0.22, 1);
spotLight.position.set(0, 25, 0);
spotLight.castShadow = true;
spotLight.shadow.bias = -0.0001;
scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Soft, even lighting
scene.add(ambientLight);

const axesHelper = new THREE.AxesHelper(60); // 10-unit axis
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(50, 50); // 50x50 grid
scene.add(gridHelper);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Bright white light
directionalLight.position.set(50, 100, -50);
directionalLight.castShadow = true;
scene.add(directionalLight);

const skyColor = new THREE.Color(0x87ceeb); // Sky blue
scene.background = skyColor;

const loader = new GLTFLoader().setPath("./titanic/");
loader.load(
  "scene.gltf",
  (gltf) => {
    console.log("loading model");
    const mesh = gltf.scene;

    // Compute the bounding box of the entire model
    const box = new THREE.Box3().setFromObject(mesh);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Calculate the necessary upward adjustment
    const offsetY = size.y / 2 - box.min.y;

    // Scale, center, and adjust the model
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 70 / maxDim; // Scale model to fit within a 10-unit box
    mesh.scale.set(scale, scale, scale);
    mesh.position.set(
      -center.x * scale, // Center horizontally
      offsetY * scale, // Adjust vertically
      -center.z * scale // Center depth-wise
    );

    scene.add(mesh);

    // Position camera back based on the largest dimension
    // const cameraDistance = maxDim * 1.5; // Adjust factor as needed
    // camera.position.set(0, maxDim * 0.5, cameraDistance);
    // camera.lookAt(0, 0, 0);
    // camera.updateProjectionMatrix();

    // Position the camera to focus on the ship
    const cameraDistance = maxDim * 20; // Adjust factor as needed
    camera.position.set(0, maxDim * 10.5, cameraDistance);
    camera.lookAt(0, offsetY * scale, 0);
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
