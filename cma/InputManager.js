import * as THREE from "three";

export class InputManager extends THREE.EventDispatcher {
    /* 
    Input Manager Events:
    - selectup
    - selectdown
    - togglemenu

    Raycast Target Events:
    - hoverup
    - hoverdown
    - selectup
    - selectdown
    */

    constructor(targetTransform) {
        super();

        this.targetTransform = targetTransform;
        this.raycaster = new THREE.Raycaster();
        this.raycastTargetsWorld = [];
        this.raycastTargetsGui = [];
        this.raycastTargets = this.raycastTargetsWorld;
        this.upDirection = new THREE.Vector3(0, 1, 0);
        this.isSelectorDown = false;
        this.selectedPosition = null;
        this.isMenuEnabled = false;
        this.intersection = null;

        // this.addEventListener("hover", (event) => {
        //     this.selectorX = event.posX;
        //     this.selectorY = event.posY;
        // });
        this.addEventListener("selectdown", (event) => {
            this.isSelectorDown = true;
            if (this.intersection) {
                this.intersection.object.dispatchEvent(event);
            }
        });
        this.addEventListener("selectup", (event) => {
            this.isSelectorDown = false;
            if (this.intersection) {
                this.intersection.object.dispatchEvent(event);
            }
        });
    }

    raycast() {
        return this.raycastTargets.reduce((closestIntersection, obj) => {
            const intersection = this.raycaster.intersectObject(obj, true);
            if (!intersection[0]) return closestIntersection;
            if (
                !closestIntersection ||
                intersection[0].distance < closestIntersection.distance
            ) {
                intersection[0].object = obj;
                return intersection[0];
            }
            return closestIntersection;
        }, null);
    }

    getForwardVector() {
        let vector = new THREE.Vector3();
        this.targetTransform.getWorldDirection(vector);
        vector.y = 0;
        vector.normalize();
        return vector;
    }

    getSideVector() {
        let vector = this.getForwardVector().cross(this.targetTransform.up);
        return vector;
    }

    handleRaycast() {
        let intersect = this.raycast();
        if (intersect) {
            if (
                !this.intersection ||
                intersect.object !== this.intersection.object
            ) {
                if (this.intersection) {
                    this.intersection.object.dispatchEvent({
                        type: "hoverup",
                    });
                }
                this.intersection = intersect;
                this.intersection.object.dispatchEvent({
                    type: "hoverdown",
                });
            }
            this.intersection = intersect;
        } else if (this.intersection !== null) {
            this.intersection.object.dispatchEvent({
                type: "hoverup",
            });
            this.intersection = null;
        }
    }

    toggleMenu() {
        this.isMenuEnabled = !this.isMenuEnabled;
        this.dispatchEvent({
            type: "togglemenu",
            isEnabled: this.isMenuEnabled,
        });
        if (this.isMenuEnabled) {
            this.raycastTargets = this.raycastTargetsGui;
        } else {
            this.raycastTargets = this.raycastTargetsWorld;
        }
    }

    update(deltaTime, frame) {}
}
