import * as THREE from "three";

export class RaycastHelper {

	constructor() {
		this.raycaster = new THREE.Raycaster();
		this.raycastTargetsWorld = [];
        this.raycastTargetsUi = [];
        this.raycastTargets = this.raycastTargetsWorld;
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

	targetWorld() {
		this.raycastTargets = this.raycastTargetsWorld;
	}

	targetUi() {
		this.raycastTargets = this.raycastTargetsUi;
	}

}