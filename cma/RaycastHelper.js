import * as THREE from "three";
import * as CMA from "./Cma.js";
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
        let intersections = this.raycaster.intersectObjects([...this.raycastTargets], true);
        let closestInteresction = null;
        for (let entry of intersections) {
            if (isObjectFloor(entry.object)) {
                closestInteresction = entry.object;
            }
        }
        if (closestInteresction) {
            return this.raycaster.intersectObject(closestInteresction, false)[0].distance;
        }
        return Infinity;
    }

    registerObjectInGui(object) {
        object.traverse((obj) => {
            if (obj instanceof CMA.Button) {
                this.raycastTargetsGui.add(obj);
            }
        });
    }

    registerObjectInWorld(object) {
        object.traverse((obj) => {
            if (obj.material && obj.material.transparent == false) {
                this.raycastTargetsWorld.add(obj);
            }
            if (obj.userData.tags && obj.userData.tags[0] == "floor") {
                obj.material.transparent = true;
                obj.material.opacity = 0.0;
                obj.material.side = THREE.DoubleSide;
                obj.position.y += 0.02;
                this.raycastTargetsWorld.add(obj);
            }
        });
    }

	targetWorld() {
		this.raycastTargets = this.raycastTargetsWorld;
	}

	targetUi() {
		this.raycastTargets = this.raycastTargetsGui;
	}

}