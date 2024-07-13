import * as THREE from "three";
import * as CMA from "./Cma.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ThreeMeshUI from "three-mesh-ui";
import { VRButton } from 'three/addons/webxr/VRButton.js';

export class Session {
    constructor(sessionMode) {
        this.worldScene = new THREE.Scene();
        this.guiScene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.sessionMode = sessionMode;

        // camera
        this.targetCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.targetCamera.rotation.order = "YXZ";
        this.targetCamera.position.z = 0;
        this.guiScene.add(this.targetCamera);

        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // handle autoclear manually
        this.renderer.autoClear = false;
        document.body.appendChild(this.renderer.domElement);

        // light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        ambientLight.castShadow = true;
        this.worldScene.add(ambientLight);

        switch(this.sessionMode) {
            case "desktop":
                this.inputManager = new CMA.DesktopInputManager(this.targetCamera);
                break;
            case "vr-6dof":
                this.renderer.xr.enabled = true;
                this.inputManager = new CMA.HmdVrInputManager(this.targetCamera, this.renderer.xr);
                this.inputManager.addControllersToScene(this.guiScene);
                break;
        }

        //this.inputManager.raycastTargets.push(this.guiScene);

        if (this.renderer.xr.enabled) {
            document.body.appendChild( VRButton.createButton( this.renderer ) );
        }
    }
    
    loop(deltaTime) {}

    animate() {
        this.renderer.clear();
        this.renderer.render(this.worldScene, this.targetCamera);

        this.renderer.clearDepth();
        this.renderer.render(this.guiScene, this.targetCamera);
        
        const deltaTime = this.clock.getDelta();
        this.inputManager.update(deltaTime);
        ThreeMeshUI.update();
        this.loop(deltaTime);
    }

    start() {
        const loader = new GLTFLoader();
        const shiba = "./public/shiba_model/scene.gltf";
        const apartment = "./public/apartment_v2/apartment.glb";

        loader.load(
            apartment,
            function (gltf) {
                this.worldScene.add(gltf.scene);
            }.bind(this),
            undefined,
            function (error) {
                console.error(error);
            }
        );

        this.renderer.setAnimationLoop(this.animate.bind(this));
    }
}
