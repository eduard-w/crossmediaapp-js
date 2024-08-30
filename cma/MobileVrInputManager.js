import * as THREE from "three";

import { InputManager } from "./InputManager";

export class MobileVrInputManager extends InputManager {
    constructor(targetTransform, startPosition, raycastHelper, xr, canvas) {
        super(targetTransform, startPosition, raycastHelper);

        this.xr = xr;
		this.setupXrReferenceSpace();

		this.canvas = canvas;
        this.marker = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
        );
        this.button0_hold_time = null;
		this.teleportationSelectionQueued = false;
		this.teleportationQueued = false;

		this.screenCenter = new THREE.Vector2(0,0);
		this.controller = this.xr.getController(0);
		if (this.controller) {
			this.controller.addEventListener("connected", function (event) {
				this.add(MobileVrInputManager.buildController());
			});

			this.controller.addEventListener("selectstart", () => {
				this.dispatchEvent({
					type: "selectdown",
				});
				this.button0_hold_time = performance.now();
				if (this.isFloorTargeted()) {
					this.teleportationSelectionQueued = true;
				}
			});

			this.controller.addEventListener("selectend", () => {
				this.dispatchEvent({
					type: "selectup",
				});
				this.button0_hold_time = null;

				if (this.isFloorTargeted() && this.teleportationSelectionQueued) {
					this.teleportationQueued = true;
				}
				this.teleportationSelectionQueued = false;
			});		
		} else {
			console.error("no controller found");
		}

    }

	static buildController() {
        let geometry, material;

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

    addControllersToScene(scene) {
        scene.add(this.controller, this.marker);
    }

    toggleMenu() {
        super.toggleMenu();
    }

    update(deltaTime, frame) {
		this.currentFrame = frame;

		// align raycaster
		this.raycastHelper.raycaster.setFromCamera(this.screenCenter, this.targetTransform);
		this.handleRaycast();

		if (this.isFloorTargeted()) {
			this.marker.position.copy(this.intersection.point);
			this.marker.visible = true;
		} else {
			this.marker.visible = false;
		}

		if (this.teleportationQueued) {
			this.performXrTeleportation(frame, this.intersection.point.setComponent(1,this.intersection.point.y+this.yOffset));
			this.teleportationQueued = false;
		}

		// hold for 2000 milliseconds
		if (
			!this.intersection &&
			this.button0_hold_time &&
			performance.now() - this.button0_hold_time > 2000
		) {
			this.toggleMenu();
			this.button0_hold_time = null;
		}
    }
}
