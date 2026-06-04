import * as THREE from "https://esm.sh/three@0.160.0";
import { GLTFLoader } from "https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";

const section = document.getElementById("torii");
const canvas = document.getElementById("torii-canvas");

if (section && canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        500
    );

    camera.position.set(0, 1.2, 18);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: false,
        antialias: true
    });

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const mainLight = new THREE.DirectionalLight(0xffd6a5, 3);
    mainLight.position.set(4, 6, 5);
    scene.add(mainLight);

    const sideLight = new THREE.PointLight(0xff3b1f, 2.5, 20);
    sideLight.position.set(-4, 3, 4);
    scene.add(sideLight);

    let torii = null;
    let leftLamp = null;
    let rightLamp = null;
    let leftFire = null;
    let rightFire = null;

    let mouseX = 0;
    let mouseY = 0;

    let isDraggingLeftLamp = false;
    let isDraggingRightLamp = false;
    let lastMouseX = 0;

    const loader = new GLTFLoader();

    loader.load("./assets/torii.glb", (gltf) => {
        torii = gltf.scene;
        torii.scale.set(3, 3, 3);
        torii.position.set(-3, -30, -100);
        scene.add(torii);
    });

    loader.load("./assets/japanese-lamp.glb", (gltf) => {
        leftLamp = gltf.scene;
        leftLamp.scale.set(0.65, 0.65, 0.65);
        leftLamp.position.set(-17, -8, -14);
        leftLamp.rotation.y = Math.PI * 0.08;
        scene.add(leftLamp);
    });

    loader.load("./assets/japanese-lamp.glb", (gltf) => {
        rightLamp = gltf.scene;
        rightLamp.scale.set(0.65, 0.65, 0.65);
        rightLamp.position.set(17, -8, -14);
        rightLamp.rotation.y = -Math.PI * 0.08;
        scene.add(rightLamp);
    });

    function createFire(x, y, z) {
        const fireGroup = new THREE.Group();
        const flameShapes = [];
        const colors = [0xff3300, 0xff7700, 0xffcc33, 0xffffaa];

        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.SphereGeometry(0.18 - i * 0.025, 16, 16);
            geometry.scale(0.8, 2.4 - i * 0.25, 0.8);

            const material = new THREE.MeshBasicMaterial({
                color: colors[i],
                transparent: true,
                opacity: 0.55 + i * 0.08
            });

            const flame = new THREE.Mesh(geometry, material);
            flame.position.y = i * 0.12;
            flame.position.x = (i - 1.5) * 0.04;
            flame.position.z = (i - 1.5) * 0.03;

            flameShapes.push(flame);
            fireGroup.add(flame);
        }

        const fireLight = new THREE.PointLight(0xff8a2a, 3, 10);
        fireLight.position.set(0, 0.35, 0);
        fireGroup.add(fireLight);

        fireGroup.position.set(x, y, z);
        fireGroup.userData.flames = flameShapes;
        fireGroup.userData.light = fireLight;

        return fireGroup;
    }

    leftFire = createFire(-17, -3, -14);
    leftFire.scale.set(1, 1, 1);

    rightFire = createFire(17, -3, -14);
    rightFire.scale.set(1, 1, 1);

    scene.add(leftFire);
    scene.add(rightFire);

    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();

        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        const deltaX = e.clientX - lastMouseX;

        if (isDraggingLeftLamp && leftLamp) {
            leftLamp.rotation.y += deltaX * 0.01;
        }

        if (isDraggingRightLamp && rightLamp) {
            rightLamp.rotation.y += deltaX * 0.01;
        }

        lastMouseX = e.clientX;
    });

    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();

        const clickX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;

        lastMouseX = e.clientX;

        if (clickX < -0.45) {
            isDraggingLeftLamp = true;
        } else if (clickX > 0.45) {
            isDraggingRightLamp = true;
        }
    });

    window.addEventListener("mouseup", () => {
        isDraggingLeftLamp = false;
        isDraggingRightLamp = false;
    });

    function animate() {
        requestAnimationFrame(animate);

        if (torii) {
            const targetRotationY = mouseX * 0.08;
            const targetRotationX = -mouseY * 0.025;

            torii.rotation.y += (targetRotationY - torii.rotation.y) * 0.04;
            torii.rotation.x += (targetRotationX - torii.rotation.x) * 0.04;
        }

        const time = performance.now() * 0.006;

        if (leftFire && rightFire) {
            [leftFire, rightFire].forEach((fire, fireIndex) => {
                fire.userData.flames.forEach((flame, i) => {
                    const flicker =
                        1 + Math.sin(time * (2 + i) + fireIndex + i) * 0.18;

                    flame.scale.set(
                        0.8 + Math.sin(time * 3 + i) * 0.08,
                        flicker,
                        0.8 + Math.cos(time * 2 + i) * 0.08
                    );

                    flame.position.y =
                        i * 0.12 + Math.sin(time * 4 + i) * 0.03;

                    flame.material.opacity =
                        0.45 + Math.sin(time * 5 + i) * 0.18;
                });

                fire.userData.light.intensity =
                    2.5 + Math.sin(time * 6 + fireIndex) * 0.8;
            });
        }

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}