import * as THREE from "three";

import { InputManager } from "./InputManager";

export class DesktopInputManager extends InputManager {
    constructor(targetTransform, raycastHelper) {
        super(targetTransform, raycastHelper);
        this.keyStates = {};
        this.targetVelocity = new THREE.Vector3();
        this.selectorX = 0;
        this.selectorY = 0;

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

        document.body.addEventListener("mousemove", (event) => {
            this.selectorX = (event.clientX / window.innerWidth) * 2 - 1;
            this.selectorY = -(event.clientY / window.innerHeight) * 2 + 1;
            // const dX = x - this.lastX;
            // const dY = y - this.lastY;
            // this.lastX = x;
            // this.lastY = y;

            // this.dispatchEvent({
            //     type: "hover",
            //     posX: x,
            //     posY: y,
            //     movementX: dX,
            //     movementY: dY,
            // });

            if (document.pointerLockElement === document.body) {
                this.targetTransform.rotation.x = clamp(
                    this.targetTransform.rotation.x - event.movementY / 500,
                    -Math.PI / 2 + 0.01,
                    Math.PI / 2 - 0.01
                );
                this.targetTransform.rotation.y -= event.movementX / 500;
            }
        });

        // document.addEventListener("click", (event) => {
        //     const x = ( event.clientX / window.innerWidth ) * 2 - 1;
        //     const y = -( event.clientY / window.innerHeight ) * 2 + 1;

        //     this.dispatchEvent({
        //         type: 'select',
        //         posX: x,
        //         posY: y,
        //     })
        // });

        document.addEventListener("click", (event) => {
            if (!this.isMenuEnabled) {
                document.body.requestPointerLock();
            }
        });

        window.addEventListener("pointerdown", (event) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.dispatchEvent({
                type: "selectdown",
                // posX: x,
                // posY: y,
            });
        });

        window.addEventListener("pointerup", (event) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.dispatchEvent({
                type: "selectup",
                // posX: x,
                // posY: y,
            });
        });

        document.addEventListener("keydown", (event) => {
            this.keyStates[event.code] = true;
        });

        document.addEventListener("keyup", (event) => {
            this.keyStates[event.code] = false;

            if (event.code === "KeyQ") {
                this.toggleMenu();
            }
        });
    }

    toggleMenu() {
        super.toggleMenu();

        if (this.isMenuEnabled) {
            document.exitPointerLock();
        } else {
            document.body.requestPointerLock();
        }
    }

    update(deltaTime, frame) {
        // frame argument is undefined in desktop mode

        this.raycastHelper.raycaster.setFromCamera(
            new THREE.Vector2(this.selectorX, this.selectorY),
            this.targetTransform
        );
        this.handleRaycast();

        const speedDelta = deltaTime * 10;
        this.targetVelocity.set(0, 0, 0);

        if (this.keyStates["KeyW"]) {
            this.targetVelocity.add(
                this.getForwardVector().multiplyScalar(speedDelta)
            );
        }

        if (this.keyStates["KeyS"]) {
            this.targetVelocity.add(
                this.getForwardVector().multiplyScalar(-speedDelta)
            );
        }

        if (this.keyStates["KeyA"]) {
            this.targetVelocity.add(
                this.getSideVector().multiplyScalar(-speedDelta)
            );
        }

        if (this.keyStates["KeyD"]) {
            this.targetVelocity.add(
                this.getSideVector().multiplyScalar(speedDelta)
            );
        }

        if (this.keyStates["Space"]) {
            this.targetVelocity.add(
                this.upDirection.clone().multiplyScalar(speedDelta)
            );
        }

        if (this.keyStates["ShiftLeft"]) {
            this.targetVelocity.add(
                this.upDirection.clone().multiplyScalar(-speedDelta)
            );
        }

        this.targetTransform.position.add(this.targetVelocity);
    }
}
