import * as THREE from "three";

import { InputManager } from "./InputManager";

export class MobileArInputManager extends InputManager {
    constructor(targetTransform, raycastHelper, xr, canvas) {
        super(targetTransform, raycastHelper);
        this.xr = xr;
		this.canvas = canvas;
        this.xr.addEventListener(
            "sessionstart",
            () => ( this.xr.getSession().requestReferenceSpace("local-floor").then((refSpace) => {
                this.baseReferenceSpace = refSpace;
            }))
        );
        this.baseReferenceSpace = null;
        this.marker = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 32).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ color: 0xbcbcbc })
        );
        this.button0_hold_time = null;
		this.teleportationQueued = false;

		this.screenCenter = new THREE.Vector2(0,0);
		this.controller = this.xr.getController(0);
		if (this.controller) {
			this.controller.addEventListener("connected", function (event) {
				this.add(MobileArInputManager.buildController());
			});

			this.controller.addEventListener("selectstart", () => {
				this.dispatchEvent({
					type: "selectdown",
				});
				this.button0_hold_time = performance.now();
			});

			this.controller.addEventListener("selectend", () => {
				this.dispatchEvent({
					type: "selectup",
				});
				this.button0_hold_time = null;

				if (this.isFloorTargeted()) {
					this.teleportationQueued = true;
				}
			});		
		} else {
			console.error("no controller found");
		}

		this.setupMenuButton();
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

	setupMenuButton() {
		const overlay = document.getElementById('overlay');

		const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
		svg.setAttribute( 'width', 38 );
		svg.setAttribute( 'height', 38 );
		svg.style.position = 'absolute';
		svg.style.left = 'calc(100% - 50px)';
		svg.style.top = '40px';
		svg.addEventListener( 'click', function() {
			//console.log('overlay button press');
			this.toggleMenu();
		}.bind(this));
		overlay.appendChild( svg );

		const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute('d', 'M 12,12 H 28 M 12,20 H 28 M 12,28 H 28');
		path.setAttribute( 'stroke', '#fff' );
		path.setAttribute( 'stroke-width', 2 );
		svg.appendChild( path );
	}

	setupInteractButton() {

	}

    toggleMenu() {
        super.toggleMenu();
    }

    update(deltaTime, frame) {
		this.currentFrame = frame;

		// align raycaster
		if (this.button0_hold_time) {
			this.raycastHelper.raycaster.setFromCamera(this.screenCenter, this.targetTransform);
			this.handleRaycast();
		}
		

		// if (this.isFloorTargeted()) {
		// 	this.marker.position.copy(this.intersection.point);
		// 	this.marker.visible = true;
		// } else {
		// 	this.marker.visible = false;
		// }

		// if (this.teleportationQueued) {
		// 	const viewerPosition = frame.getViewerPose(
		// 		this.baseReferenceSpace
		// 	).transform.position;
		// 	const offsetPosition = {
		// 		x: -this.intersection.point.x + viewerPosition.x,
		// 		y: -this.intersection.point.y,
		// 		z: -this.intersection.point.z + viewerPosition.z,
		// 		w: 1,
		// 	};
		// 	const offsetRotation = new THREE.Quaternion();
		// 	const transform = new XRRigidTransform(
		// 		offsetPosition,
		// 		offsetRotation
		// 	);
		// 	const teleportSpaceOffset =
		// 		this.baseReferenceSpace.getOffsetReferenceSpace(
		// 			transform
		// 		);

		// 	this.xr.setReferenceSpace(teleportSpaceOffset);
		// 	this.teleportationQueued = false;
		// }

		// hold for 2000 milliseconds
		// if (
		// 	this.button0_hold_time &&
		// 	performance.now() - this.button0_hold_time > 2000
		// ) {
		// 	this.toggleMenu();
		// 	this.button0_hold_time = null;
		// }
    }
}
