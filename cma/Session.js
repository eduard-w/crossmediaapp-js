import * as THREE from "three";
import * as CMA from "./Cma.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import ThreeMeshUI from "three-mesh-ui";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { ARButton } from "three/addons/webxr/ARButton.js";

export class Session extends THREE.EventDispatcher {
    constructor() {
        super();

        this.worldScene = new THREE.Scene();
        this.guiScene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.raycastHelper = new CMA.RaycastHelper();

        // camera
        this.targetCamera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.targetCamera.rotation.order = "YXZ";
        this.targetCamera.position.z = 0;
        this.targetCamera.position.y = 1;
        this.guiScene.add(this.targetCamera);

        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // handle autoclear manually
        this.renderer.autoClear = false;
        document.body.appendChild(this.renderer.domElement);

        this.launchMenu = new CMA.LaunchMenu(document.body);

        this.launchMenu.desktopButton.addEventListener('click', (event) => {
            this.inputManager = new CMA.DesktopInputManager(
                this.targetCamera, this.raycastHelper
            );
            this.start();
            
        });

        this.sessionOptions = {
            optionalFeatures: [
                'local-floor',
                'bounded-floor',
                'layers',
            ],
        };

        this.launchMenu.vrButton.addEventListener('click', (event) => {
            this.renderer.xr.enabled = true;
            navigator.xr.requestSession( 'immersive-vr', this.sessionOptions ).then((session) => {
                this.renderer.xr.setSession(session);
            });
            this.inputManager = new CMA.HmdVrInputManager(
                this.targetCamera,
                this.raycastHelper,
                this.renderer.xr
            );
            this.inputManager.addControllersToScene(this.guiScene);
            this.start();
        });

        this.launchMenu.arButton.addEventListener('click', (event) => {
            this.renderer.xr.enabled = true;
            navigator.xr.requestSession( 'immersive-ar', this.sessionOptions ).then((session) => {
                this.renderer.xr.setSession(session);
            });
            this.inputManager = new CMA.HmdVrInputManager(
                this.targetCamera,
                this.raycastHelper,
                this.renderer.xr
            );
            this.inputManager.addControllersToScene(this.guiScene);
            this.start();
        });

        this.renderer.clear();
        this.renderer.render(this.worldScene, this.targetCamera);
    }

    registerUi(object) {
        this.raycastHelper.raycastTargetsUi.push(object);
    }

    registerObject(object) {
        this.raycastHelper.raycastTargetsWorld.push(object);
    }



    loop(deltaTime) {}

    drawFrame(time, frame) {
        this.renderer.clear();
        this.renderer.render(this.worldScene, this.targetCamera);

        this.renderer.clearDepth();
        this.renderer.render(this.guiScene, this.targetCamera);

        const deltaTime = this.clock.getDelta();
        this.inputManager.update(deltaTime, frame);
        ThreeMeshUI.update();
    }

    start() {
        const loader = new GLTFLoader();
        const shiba = "./public/shiba_model/scene.gltf";
        const apartment = "./public/apartment_v3/apartment.gltf";

        loader.load(
            apartment,
            function (gltf) {
                this.worldScene.add(gltf.scene);
                this.worldScene.traverse((obj) => {
                    if (obj.material && obj.material.transparent == false) {
                        this.registerObject(obj,);
                    }
                    if (obj.userData.tags && obj.userData.tags == "walkable") {
                        obj.material.transparent = true;
                        obj.material.opacity = 0.0;
                        obj.material.side = THREE.DoubleSide;
                        obj.position.y += 0.02;
                        this.registerObject(obj,);
                    }
                    // this.inputManager.raycastTargetsWorld.push(obj);
                });
            }.bind(this),
            undefined,
            function (error) {
                console.error(error);
            }
        );

        this.renderer.setAnimationLoop(this.drawFrame.bind(this));

        this.dispatchEvent({
            type: 'started'
        });
    }
}
