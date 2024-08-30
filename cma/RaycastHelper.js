import * as THREE from "three";
import { isObjectFloor } from "./Utils.js";

export class RaycastHelper {
    constructor() {
        this.raycaster = new THREE.Raycaster();
        this.raycastTargetsWorld = new Set();
        this.raycastTargetsGui = new Set();
        this.raycastTargets = this.raycastTargetsWorld;
    }

    raycastClosest() {
        return [...this.raycastTargets].reduce((closestIntersection, obj) => {
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

    raycastFloorDistance() {
        let intersections = this.raycaster.intersectObjects(
            [...this.raycastTargets],
            true
        );
        let closestInteresction = null;
        for (let entry of intersections) {
            if (isObjectFloor(entry.object)) {
                if (
                    (closestInteresction &&
                        closestInteresction.distane > entry.distance) ||
                    !closestInteresction
                ) {
                    closestInteresction = entry;
                }
            }
        }
        if (closestInteresction) {
            return this.raycaster.intersectObject(
                closestInteresction.object,
                false
            )[0].distance;
        }
        return Infinity;
    }

    targetWorld() {
        this.raycastTargets = this.raycastTargetsWorld;
    }

    targetUi() {
        this.raycastTargets = this.raycastTargetsGui;
    }
}
