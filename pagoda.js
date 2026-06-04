console.log("SAKURA TREE JS LOADED");

import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const section = document.getElementById("about");
const canvas = document.getElementById("pagoda-canvas");

if (section && canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    );

    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));

    const warmLight = new THREE.PointLight(0xff8e53, 4, 14);
    warmLight.position.set(2.5, 3, 3);
    scene.add(warmLight);

    const softPinkLight = new THREE.PointLight(0xff9bd5, 3, 12);
    softPinkLight.position.set(-3, 2.5, 3);
    scene.add(softPinkLight);

    const moonLight = new THREE.DirectionalLight(0xb8d8ff, 1.8);
    moonLight.position.set(-4, 5, 5);
    scene.add(moonLight);

    let sakuraTree = null;
    let mouseX = 0;
    let mouseY = 0;

    const loader = new GLTFLoader();

    loader.load(
        "./assets/sakuratree.glb",
        (gltf) => {
            sakuraTree = gltf.scene;

            sakuraTree.position.set(0, -4, -4.5);
            sakuraTree.scale.set(24, 24 , 24);
            sakuraTree.rotation.y = Math.PI;

            scene.add(sakuraTree);
        },
        undefined,
        (error) => {
            console.error("Sakura tree loading failed:", error);
        }
    );

    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();

        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function updateScrollAnimation() {
        const rect = section.getBoundingClientRect();
        const progress = Math.min(
            1,
            Math.max(0, 1 - rect.top / window.innerHeight)
        );

        if (progress > 0.35) {
            section.classList.add("show-about");
        } else {
            section.classList.remove("show-about");
        }

        if (sakuraTree) {
            const time = performance.now() * 0.0001;

            // slow auto rotation
            const autoRotation = Math.PI + time;

            // mouse interrupt / influence
            const mouseInfluenceY = mouseX * 0.35;
            const mouseInfluenceX = -mouseY * 0.08;

            sakuraTree.rotation.y +=
                (autoRotation + mouseInfluenceY - sakuraTree.rotation.y) * 0.035;

            sakuraTree.rotation.x +=
                (mouseInfluenceX - sakuraTree.rotation.x) * 0.035;
        }
    }

    function animate() {
        requestAnimationFrame(animate);
        updateScrollAnimation();
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}