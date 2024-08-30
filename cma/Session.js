import * as THREE from "three";
import * as CMA from "./Cma.js";
import ThreeMeshUI from "three-mesh-ui";
import { isOnMobile } from "./Utils.js";

export class Session extends THREE.EventDispatcher {
    constructor() {
        super();

        // setup scenes manually
        this.worldScene = null;
        this.guiScene = null;

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

        this.appMenu = new CMA.AppMenu();
        this.appMenu.buttonClose.addEventListener('click', (event) => {
            this.inputManager.toggleMenu();
        });
        this.registerObjectInGui(this.appMenu.buttonClose);
        this.appMenu.buttonQuit.addEventListener('click', (event) => {
            this.quit();
        });
        this.registerObjectInGui(this.appMenu.buttonQuit);

        // renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // handle autoclear manually
        this.renderer.autoClear = false;
        document.body.appendChild(this.renderer.domElement);

        this.hasTouchScreen = isOnMobile();

        this.sessionOptions = {
            optionalFeatures: ["local-floor", "bounded-floor", "layers", "dom-overlay"],
        };
        
        this.launchMenu = new CMA.LaunchMenu(document.body);
        this.launchMenu.desktopButton.addEventListener("click", (event) => {
            this.launchDesktopSession();
        });
        this.launchMenu.vrButton.addEventListener("click", (event) => {
            this.launchVrSession();
        });
        this.launchMenu.arButton.addEventListener("click", (event) => {
            this.launchArSession();
        });

        this.mode = null;
        this.nextTeleportPosition = null;
    }

    setWorldScene(scene) {
        this.worldScene = scene;
        this.renderer.clear();
        this.renderer.render(this.worldScene, this.targetCamera);
    }

    setGuiScene(scene) {
        this.guiScene = scene;
        this.guiScene.add(this.targetCamera);
    }

    registerObjectInGui(object) {
        this.raycastHelper.raycastTargetsGui.add(object);
    }

    unregisterObjectInGui(object) {
        this.raycastHelper.raycastTargetsGui.delete(object);
    }

    registerObjectInWorld(object) {
        this.raycastHelper.raycastTargetsWorld.add(object);
    }

    unregisterObjectInWorld(object) {
        this.raycastHelper.raycastTargetsWorld.delete(object);
    }

    launchDesktopSession() {
        // desktop sessions don't need quit button
        this.appMenu.remove(this.appMenu.buttonQuit);

        this.setupDomOverlay();
        this.inputManager = new CMA.DesktopInputManager(
            this.targetCamera,
            this.startPosition,
            this.raycastHelper
        );
        this.setupFollowMenu();
        this.mode = "desktop";
        this.start();
    }

    launchVrSession() {
        this.renderer.xr.enabled = true;
        navigator.xr
            .requestSession("immersive-vr", this.sessionOptions)
            .then((session) => {
                this.renderer.xr.setSession(session);
            });
        if (this.hasTouchScreen) {
            // Mobile
            this.inputManager = new CMA.MobileVrInputManager(
                this.targetCamera,
                this.startPosition,
                this.raycastHelper,
                this.renderer.xr,
                this.renderer.domElement
            );
            this.setupInWorldMenu();
            this.mode = "mobile-vr";
        } else {
            // HMD
            this.inputManager = new CMA.HmdVrInputManager(
                this.targetCamera,
                this.startPosition,
                this.raycastHelper,
                this.renderer.xr
            );
            this.setupInWorldMenu();
            this.mode = "hmd-vr";
        }
        if (!this.guiScene) {
            this.setGuiScene(new THREE.Scene());
        }
        this.inputManager.mode = "immersive-vr";
        this.inputManager.addControllersToScene(this.guiScene);
        this.start();
    }

    launchArSession() {
        this.renderer.xr.enabled = true;

        if (this.hasTouchScreen) {
            this.setupDomOverlay();
        }

        navigator.xr
            .requestSession("immersive-ar", this.sessionOptions)
            .then((session) => {
                this.renderer.xr.setSession(session);
            });
        if (this.hasTouchScreen) {
            // Mobile
            this.inputManager = new CMA.MobileArInputManager(
                this.targetCamera,
                this.startPosition,
                this.raycastHelper,
                this.renderer.xr,
                this.renderer.domElement
            );
            this.setupFollowMenu();
            this.mode = "mobile-ar";
        } else {
            // HMD
            this.inputManager = new CMA.HmdVrInputManager(
                this.targetCamera,
                this.startPosition,
                this.raycastHelper,
                this.renderer.xr
            );
            this.setupInWorldMenu();
            this.mode = "hmd-ar";
        }
        if (!this.guiScene) {
            this.setGuiScene(new THREE.Scene());
        }
        this.inputManager.mode = "immersive-ar";
        this.inputManager.addControllersToScene(this.guiScene);
        this.start();
    }

    setupDomOverlay() {
        this.overlay = document.createElement( 'div' );
        this.overlay.setAttribute('id', 'overlay');
        document.body.appendChild( this.overlay );
        this.sessionOptions.domOverlay = { root: this.overlay };     
    }

    setupFollowMenu() {
        this.appMenu.position.set(0, 0, -2);
        this.inputManager.addEventListener("togglemenu", (event) => {
            if (event.isEnabled) {
                this.targetCamera.add(this.appMenu);
            } else {
                this.targetCamera.remove(this.appMenu);
            }
        });
    }

    setupInWorldMenu() {
        this.inputManager.addEventListener("togglemenu", (event) => {
            if (event.isEnabled) {
                const direction = new THREE.Vector3();
                this.targetCamera.getWorldDirection(direction);
                this.appMenu.position.copy(this.targetCamera.position).add(direction.multiplyScalar(2));
                this.appMenu.lookAt(this.targetCamera.position);
                this.guiScene.add(this.appMenu);
            } else {
                this.guiScene.remove(this.appMenu);
            }
        });
    }

    drawFrame(time, frame) {
        if (this.nextTeleportPosition) {
            if (frame) {
                this.inputManager.performXrTeleportation(frame, this.nextTeleportPosition);
            } else {
                this.inputManager.targetTransform.position.copy(this.nextTeleportPosition);
            }
            this.nextTeleportPosition = null;
        }

        this.renderer.clear();
        this.renderer.render(this.worldScene, this.targetCamera);

        this.renderer.clearDepth();
        this.renderer.render(this.guiScene, this.targetCamera);

        const deltaTime = this.clock.getDelta();
        this.inputManager.update(deltaTime, frame);
        ThreeMeshUI.update();
        this.dispatchEvent({
            type: "update",
            deltaTime: time
        });
    }

    queueTeleport(position) {
        this.nextTeleportPosition = position;
    }

    start() {
        this.renderer.setAnimationLoop(this.drawFrame.bind(this));
        this.dispatchEvent({
            type: "started",
        });
        console.log("session started");
    }

    quit() {
        this.renderer.xr.getSession().end();
    }
}
