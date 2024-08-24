import * as THREE from "three";
import { isObjectFloor } from "./Utils.js";

export class InputManager extends THREE.EventDispatcher {
    /* 
    Input Manager Events:
    - selectup
    - selectdown
    - selectmove
    - togglemenu

    Raycast Target Events:
    - hoverup
    - hoverdown
    - selectup
    - selectdown
    */

    constructor(targetTransform, startPosition, raycastHelper) {
        super();

        this.targetTransform = targetTransform;
        this.startPosition = startPosition;
        this.raycastHelper = raycastHelper;
        
        this.upDirection = new THREE.Vector3(0, 1, 0);
        this.zeroRotation = new THREE.Quaternion(0, 0, 0, 1);
        this.isSelectorDown = false;
        this.selectedPosition = null;
        this.isMenuEnabled = false;
        this.intersection = null;
        this.xr = null;

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
        let intersect = this.raycastHelper.raycastClosest();
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

        let currentRotation = this.raycastHelper.raycaster.ray.direction.clone().normalize();
        if (this.pastRotation == null) {
            this.pastRotation = currentRotation.clone();
        }
        let rotationDelta = new THREE.Quaternion().setFromUnitVectors(this.pastRotation, currentRotation);
        if (!rotationDelta.equals(this.zeroRotation)) {
            this.dispatchEvent({
                type: "selectmove",
                movement: rotationDelta,
            });
        }
        this.pastRotation = currentRotation.clone();
    }

    isFloorTargeted() {
        if (this.intersection && this.intersection.object) {
            return isObjectFloor(this.intersection.object);
        }
        return false;
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

    setupXrReferenceSpace() {
        this.baseReferenceSpace = null;
        if (this.xr) {
            this.xr.addEventListener(
                "sessionstart",
                () => ( this.xr.getSession().requestReferenceSpace("local-floor").then((refSpace) => {
                    console.log(this.startPosition);
                    this.baseReferenceSpace = refSpace;
                    const startPositionReferenceSpace = this.baseReferenceSpace.getOffsetReferenceSpace(
                        new XRRigidTransform(
                            {
                                x: -this.startPosition.x,
                                y: -this.startPosition.y+1,
                                z: -this.startPosition.z,
                                w: 1,
                            },
                            new THREE.Quaternion()
                        )
                    );
                    this.xr.setReferenceSpace(startPositionReferenceSpace);
                }))
            );            
        }
    }

    performXrTeleportation(frame) {
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

    update(deltaTime, frame) {}
}
