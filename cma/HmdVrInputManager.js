import * as THREE from "three";

import { InputManager } from "./InputManager";
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

export class HmdVrInputManager extends InputManager {
    constructor(targetTransform, xr) {
        super(targetTransform);
        this.xr = xr;
        this.controllers = [this.xr.getController(0), this.xr.getController(1)];
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
		this.button0_pressed = false;
    }

    addControllersToScene(scene) {
        scene.add(
            this.controllers[0],
            this.controllers[1],
            this.gripControllers[0],
            this.gripControllers[1]
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

    update(deltaTime) {

        if (
            this.controllers[0].gamepad &&
            this.controllers[0].gamepad.mapping == "xr-standard"
        ) {
            // align raycaster
			let dirMat = new THREE.Matrix4();
			dirMat
				.identity()
				.extractRotation(this.controllers[0].matrixWorld);
			this.raycaster.ray.origin.setFromMatrixPosition(
				this.controllers[0].matrixWorld
			);
			this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(dirMat);
			this.handleRaycast();

			// evaluate input sources
			let gamepad = this.controllers[0].gamepad;

            // primary trigger
            if (gamepad.buttons[0].pressed && !this.button0_pressed) {
                this.dispatchEvent({
					type: "selectdown",
				});
            }
			if (!gamepad.buttons[0].pressed && this.button0_pressed) {
                this.dispatchEvent({
					type: "selectup",
				});
            }

			this.button0_pressed = gamepad.buttons[0].pressed;
        }
    }
}
