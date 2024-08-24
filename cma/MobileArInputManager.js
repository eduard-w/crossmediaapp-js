import * as THREE from "three";

import { InputManager } from "./InputManager";

export class MobileArInputManager extends InputManager {
    constructor(targetTransform, startPosition, raycastHelper, xr, canvas) {
        super(targetTransform, startPosition, raycastHelper);

        this.xr = xr;
		this.setupXrReferenceSpace();

		this.canvas = canvas;
		this.controller = this.xr.getController(0);
		if (this.controller) {
			this.controller.addEventListener("connected", function (event) {
				this.add(MobileArInputManager.buildController());
			});

			this.controller.addEventListener("selectstart", () => {
				this.dispatchEvent({
					type: "selectdown",
				});
			});

			this.controller.addEventListener("selectend", () => {
				this.pastRotation = null;
				this.dispatchEvent({
					type: "selectup",
				});
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
        scene.add(this.controller);
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
			this.toggleMenu();
		}.bind(this));
		overlay.appendChild( svg );

		const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
		path.setAttribute('d', 'M 12,12 H 28 M 12,20 H 28 M 12,28 H 28');
		path.setAttribute( 'stroke', '#fff' );
		path.setAttribute( 'stroke-width', 2 );
		svg.appendChild( path );
	}

    toggleMenu() {
        super.toggleMenu();
    }

    update(deltaTime, frame) {
		this.raycastHelper.raycaster.setFromXRController(this.controller);
		if (this.isSelectorDown) {
			this.handleRaycast();
		}
    }
}
