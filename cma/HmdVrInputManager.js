import * as THREE from "three";

import { InputManager } from "./InputManager";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

export class HmdVrInputManager extends InputManager {
    constructor(targetTransform, xr) {
        super(targetTransform);
        this.xr = xr;
        this.xr.addEventListener(
            "sessionstart",
            () => (this.baseReferenceSpace = this.xr.getReferenceSpace())
        );
        this.baseReferenceSpace = this.xr.getReferenceSpace();
        this.controllers = [this.xr.getController(0), this.xr.getController(1)];
        this.activeController = this.controllers[1];
        for (let controller of this.controllers) {
            controller.addEventListener("connected", function (event) {
                controller.gamepad = event.data.gamepad;
                controller.add(HmdVrInputManager.buildController(event.data));
            });
        }
        const controllerModelFactory = new XRControllerModelFactory();
        this.gripControllers = [
            this.xr.getControllerGrip(0),
            this.xr.getControllerGrip(1),
        ];
        for (let controller of this.gripControllers) {
            controller.add(
                controllerModelFactory.createControllerModel(controller)
            );
        }
        this.marker = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
        );
        this.button0_pressed = false;
        this.button0_hold_time = null;
    }

    addControllersToScene(scene) {
        scene.add(
            this.controllers[0],
            this.controllers[1],
            this.gripControllers[0],
            this.gripControllers[1],
            this.marker
        );
    }

    static buildController(data) {
        let geometry, material;

        switch (data.targetRayMode) {
            case "tracked-pointer":
                geometry = new THREE.BufferGeometry();
                geometry.setAttribute(
                    "position",
                    new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
                );
                geometry.setAttribute(
                    "color",
                    new THREE.Float32BufferAttribute(
                        [0.5, 0.5, 0.5, 0, 0, 0],
                        3
                    )
                );

                material = new THREE.LineBasicMaterial({
                    vertexColors: true,
                    blending: THREE.AdditiveBlending,
                });

                return new THREE.Line(geometry, material);

            case "gaze":
                geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(
                    0,
                    0,
                    -1
                );
                material = new THREE.MeshBasicMaterial({
                    opacity: 0.5,
                    transparent: true,
                });
                return new THREE.Mesh(geometry, material);
        }
    }

    toggleMenu() {
        super.toggleMenu();
    }

    isFloorTargeted() {
        return (
            this.intersection &&
            this.intersection.object.userData.tags &&
            this.intersection.object.userData.tags == "walkable"
        );
    }

    update(deltaTime, frame) {
        if (
            this.activeController.gamepad &&
            this.activeController.gamepad.mapping == "xr-standard"
        ) {
            // align raycaster
            let dirMat = new THREE.Matrix4();
            dirMat
                .identity()
                .extractRotation(this.activeController.matrixWorld);
            this.raycaster.ray.origin.setFromMatrixPosition(
                this.activeController.matrixWorld
            );
            this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(dirMat);
            this.handleRaycast();

            if (this.isFloorTargeted()) {
                this.marker.position.copy(this.intersection.point);
                this.marker.visible = true;
            } else {
                this.marker.visible = false;
            }

            // evaluate input sources
            let gamepad = this.activeController.gamepad;

            // primary trigger
            if (gamepad.buttons[0].pressed && !this.button0_pressed) {
                this.dispatchEvent({
                    type: "selectdown",
                });
                this.button0_hold_time = performance.now();
            }
            if (!gamepad.buttons[0].pressed && this.button0_pressed) {
                this.dispatchEvent({
                    type: "selectup",
                });
                this.button0_hold_time = null;

                if (this.isFloorTargeted()) {
                    const viewerPosition = frame.getViewerPose(
                        this.baseReferenceSpace
                    ).transform.position;
                    const offsetPosition = {
                        x: -this.intersection.point.x + viewerPosition.x,
                        y: -this.intersection.point.y,
                        z: -this.intersection.point.z + viewerPosition.z,
                        w: 1,
                    };
                    const offsetRotation = new THREE.Quaternion();
                    const transform = new XRRigidTransform(
                        offsetPosition,
                        offsetRotation
                    );
                    const teleportSpaceOffset =
                        this.baseReferenceSpace.getOffsetReferenceSpace(
                            transform
                        );

                    this.xr.setReferenceSpace(teleportSpaceOffset);
                }
            }
            // hold for 2000 milliseconds
            if (
                this.button0_hold_time &&
                performance.now() - this.button0_hold_time > 2000
            ) {
                this.toggleMenu();
                this.button0_hold_time = null;
            }

            this.button0_pressed = gamepad.buttons[0].pressed;
        }
    }
}
