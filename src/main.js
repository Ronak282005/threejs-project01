import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { PMREMGenerator } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import "../style.css";   
import gsap from 'gsap';

// scene
const scene = new THREE.Scene();
// camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 4;
// objects

// add objects to scene
// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // to get great performance without losing quality
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding; // set the output encoding to sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled

// HDRI
const pmremGenerator = new PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let model;

new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        // scene.background = envMap;
        texture.dispose();
        pmremGenerator.dispose();

        // GLTFLoader
        const loader = new GLTFLoader();
        loader.load(
            "./DamagedHelmet.gltf", // replace with the path to your GLTF model
            function (gltf) {
                model = gltf.scene;
                scene.add(model);
            },
            undefined,
            function (error) {
                console.error(error);
            }
        );
    });

// Post-processing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0030; // Adjust the amount of RGB shift
composer.addPass(rgbShiftPass);


window.addEventListener('mousemove', (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    if (model) {
        gsap.to(model.rotation, {
            duration: 0.7,
            x: y * Math.PI / 4,
            y: x * Math.PI / 4,
        });
    }
})

// Resize handler
window.addEventListener('resize', () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// animation
function animate() {
    window.requestAnimationFrame(animate);
    // controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    composer.render();
}
animate();

gsap.to(rgbShiftPass.uniforms['amount'], {
    duration: 1.3,
    value: 0,
    yoyo: true,
    repeat: -1,
    ease: "power1.inOut",
    });
// GSAP animation for navbar
const tl = gsap.timeline();
tl.from(".logo", { duration: 1,delay:0.5, opacity: 0, y: -50, ease: "bounce" });
tl.from(".links a", { duration: 1, opacity: 0, y: -50, stagger: 0.2, ease: "bounce" });

tl.from(".cyber", { 
    duration: 1,
    opacity: 0,
    z: -50,
    scale: 0.5,
    ease: "bounce"
});