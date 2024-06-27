import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Session {
    constructor() {
        this.inputManager = null;
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        // camera
        this.targetCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.targetCamera.rotation.order = "YXZ";
        this.targetCamera.position.z = 15;
        this.targetVelocity = new THREE.Vector3();
        this.upDirection = new THREE.Vector3(0, 1, 0);

        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        ambientLight.castShadow = true;
        this.scene.add(ambientLight);
    }

    animate() {
        const deltaTime = this.clock.getDelta();
        this.controls(deltaTime);
        this.targetCamera.position.add(this.targetVelocity);
        this.renderer.render(this.scene, this.targetCamera);
    }

    start() {
        const loader = new GLTFLoader();
        const shiba = "./public/shiba_model/scene.gltf";
        const apartment = "./public/apartment_v2/apartment.glb";

        loader.load(
            apartment,
            function (gltf) {
                this.scene.add(gltf.scene);
            }.bind(this),
            undefined,
            function (error) {
                console.error(error);
            }
        );

        this.renderer.setAnimationLoop(this.animate.bind(this));
    }

    getForwardVector() {
        let vector = new THREE.Vector3();
        this.targetCamera.getWorldDirection(vector);
        vector.y = 0;
        vector.normalize();
        return vector;
    }

    getSideVector() {
        let vector = this.getForwardVector().cross(this.targetCamera.up);
        return vector;
    }

    controls(deltaTime) {
        const speedDelta = deltaTime * 10;
        this.targetVelocity.set(0, 0, 0);

        if (this.inputManager.inputStates["KeyW"]) {
            this.targetVelocity.add(
                this.getForwardVector().multiplyScalar(speedDelta)
            );
        }

        if (this.inputManager.inputStates["KeyS"]) {
            this.targetVelocity.add(
                this.getForwardVector().multiplyScalar(-speedDelta)
            );
        }

        if (this.inputManager.inputStates["KeyA"]) {
            this.targetVelocity.add(
                this.getSideVector().multiplyScalar(-speedDelta)
            );
        }

        if (this.inputManager.inputStates["KeyD"]) {
            this.targetVelocity.add(
                this.getSideVector().multiplyScalar(speedDelta)
            );
        }

        if (this.inputManager.inputStates["Space"]) {
            this.targetVelocity.add(
                this.upDirection.clone().multiplyScalar(speedDelta)
            );
        }

        if (this.inputManager.inputStates["ShiftLeft"]) {
            this.targetVelocity.add(
                this.upDirection.clone().multiplyScalar(-speedDelta)
            );
        }
    }
}
