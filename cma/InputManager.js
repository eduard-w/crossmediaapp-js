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
        // this.lastX = 0.0;
        // this.lastY = 0.0;
        this.raycaster = new THREE.Raycaster();
        this.raycastTargetsWorld = [];
        this.raycastTargetsGui = [];
        this.raycastTargets = [];
        this.upDirection = new THREE.Vector3(0, 1, 0);
        this.isSelectorDown = false;
        this.selectedObject = null;
        this.isMenuEnabled = false;

        // this.addEventListener("hover", (event) => {
        //     this.selectorX = event.posX;
        //     this.selectorY = event.posY;
        // });
        this.addEventListener("selectdown", (event) => {
            this.isSelectorDown = true;
            if (this.selectedObject) {
                this.selectedObject.dispatchEvent(event);
            }
        });
        this.addEventListener("selectup", (event) => {
            this.isSelectorDown = false;
            if (this.selectedObject) {
                this.selectedObject.dispatchEvent(event);
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
            if (intersect.object !== this.selectedObject) {
                if (this.selectedObject) {
                    
                    this.selectedObject.dispatchEvent({
                        type: "hoverup",
                    });
                }
                this.selectedObject = intersect.object;
                this.selectedObject.dispatchEvent({
                    type: "hoverdown",
                });
            }
        } else if (this.selectedObject !== null) {
            this.selectedObject.dispatchEvent({
                type: "hoverup",
            });
            this.selectedObject = null;
        }        
    }

    toggleMenu() {
    }

    update(deltaTime) {
    }
}
