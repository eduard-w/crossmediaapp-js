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

    constructor(targetTransform, raycastHelper) {
        super();

        this.targetTransform = targetTransform;
        this.raycastHelper = raycastHelper;
        
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
        let intersect = this.raycastHelper.raycast();
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

    isFloorTargeted() {
        return (
            this.intersection &&
            this.intersection.object.userData.tags &&
            this.intersection.object.userData.tags[0] == "floor"
        );
    }

    toggleMenu() {
        this.isMenuEnabled = !this.isMenuEnabled;
        this.dispatchEvent({
            type: "togglemenu",
            isEnabled: this.isMenuEnabled,
        });

        if (this.isMenuEnabled) {
            this.raycastHelper.targetUi();
        } else {
            this.raycastHelper.targetWorld();
        }
    }

    update(deltaTime, frame) {}
}
