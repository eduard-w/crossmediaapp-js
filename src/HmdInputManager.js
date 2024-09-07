import * as THREE from "three";
import * as CMA from "../main.js";

import { InputManager } from "./InputManager";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";

// this file is based on code from three.js
// https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_teleport.html

export class HmdVrInputManager extends InputManager {
    constructor(targetTransform, startPosition, raycastHelper, xr) {
        super(targetTransform, startPosition, raycastHelper);

        this.xr = xr;
        this.setupXrReferenceSpace();

        this.controllers = [this.xr.getController(0), this.xr.getController(1)];
        this.activeController = this.controllers[1];
        for (let controller of this.controllers) {
            controller.addEventListener("connected", function (event) {
                controller.gamepad = event.data.gamepad;
                controller.add(HmdVrInputManager.buildController());
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
        this.triggerPressed = false;
        this.triggerHoldTime = null;
        this.teleportationSelectionQueued = false;
    }

    addControllersToScene(scene) {
        scene.add(
            this.controllers[0],
            this.controllers[1],
            this.gripControllers[0],
            this.gripControllers[1]
        );
        if (this.mode == "immersive-vr") {
            scene.add(this.marker);
        }
    }

    static buildController() {
        let geometry, material;

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)
        );
        geometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3)
        );
        material = new THREE.LineBasicMaterial({
            vertexColors: true,
            blending: THREE.AdditiveBlending,
        });

        return new THREE.Line(geometry, material);
    }

    toggleMenu() {
        super.toggleMenu();
    }

    update(deltaTime, frame) {
        if (this.controllers && this.activeController.gamepad) {
            // determine active controller
            if (!this.pastButtonStates) {
                this.pastButtonStates = [[], []];
            }
            for (let i = 0; i < 2; i++) {
                let gamepad = this.controllers[i].gamepad;
                let newController = this.activeController;
                for (let j = 0; j < gamepad.buttons.length; j++) {
                    if (
                        this.pastButtonStates[i][j] !=
                        gamepad.buttons[j].pressed
                    ) {
                        newController = this.controllers[i];
                    }
                }
                this.activeController = newController;
                this.pastButtonStates[i] = [];
                for (let j = 0; j < gamepad.buttons.length; j++) {
                    this.pastButtonStates[i].push(gamepad.buttons[j].pressed);
                }
            }
        }

        if (
            this.activeController &&
            this.activeController.gamepad &&
            this.activeController.gamepad.mapping == "xr-standard"
        ) {
            // align raycaster
            let dirMat = new THREE.Matrix4();
            dirMat
                .identity()
                .extractRotation(this.activeController.matrixWorld);
            this.raycastHelper.raycaster.ray.origin.setFromMatrixPosition(
                this.activeController.matrixWorld
            );
            this.raycastHelper.raycaster.ray.direction
                .set(0, 0, -1)
                .applyMatrix4(dirMat);
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
            if (gamepad.buttons[0].pressed && !this.triggerPressed) {
                this.dispatchEvent({
                    type: "selectdown",
                });

                if (!(this.intersection && CMA.isObjectInteractable(this.intersection.object))) {
                    this.triggerHoldTime = performance.now();
                } else if (this.isFloorTargeted()) {
                    this.teleportationSelectionQueued = true;
                }
            }
            if (!gamepad.buttons[0].pressed && this.triggerPressed) {
                this.dispatchEvent({
                    type: "selectup",
                });
                this.triggerHoldTime = null;

                if (
                    this.mode == "immersive-vr" &&
                    this.isFloorTargeted() &&
                    this.teleportationSelectionQueued
                ) {
                    this.performXrTeleportation(
                        frame,
                        this.intersection.point.setComponent(
                            1,
                            this.intersection.point.y + this.yOffset
                        )
                    );
                }
                this.teleportationSelectionQueued = false;
            }
            // hold for 2000 milliseconds
            if (
                this.triggerHoldTime &&
                performance.now() - this.triggerHoldTime > 2000
            ) {
                this.toggleMenu();
                this.triggerHoldTime = null;
            }

            this.triggerPressed = gamepad.buttons[0].pressed;
        }
    }
}
