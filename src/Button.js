import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";

// this file is based on code from three-mesh-ui
// https://github.com/felixmariotto/three-mesh-ui/blob/master/examples/interactive_button.js

export class Button extends ThreeMeshUI.InlineBlock {
    constructor(options) {
        super(options);

        const idleStateAttributes = {
            state: "idle",
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color(0x666666),
                backgroundOpacity: 0.3,
                fontColor: new THREE.Color(0xffffff),
            },
        };

        const hoveredStateAttributes = {
            state: "hovered",
            attributes: {
                offset: 0.035,
                backgroundColor: new THREE.Color(0x999999),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0xffffff),
            },
        };

        const selectedStateAttributes = {
            state: "selected",
            attributes: {
                offset: 0.02,
                backgroundColor: new THREE.Color(0x777777),
                backgroundOpacity: 1,
                fontColor: new THREE.Color(0x222222),
            },
        };

        this._hoverdown = function () {
            this.setState("hovered");
        };
        this._hoverup = function () {
            this.setState("idle");
        };
        this._selectdown = function () {
            this.setState("selected");
        };
        this._selectup = function () {
            if (this.currentState == "selected") {
                this.setState("hovered");
                this.dispatchEvent({
                    type: "click",
                });
            }
        };

        this.setupState(idleStateAttributes);
        this.setupState(hoveredStateAttributes);
        this.setupState(selectedStateAttributes);

        this.addEventListener("hoverdown", this._hoverdown);
        this.addEventListener("hoverup", this._hoverup);
        this.addEventListener("selectdown", this._selectdown);
        this.addEventListener("selectup", this._selectup);

        this.setState("idle");
    }
}
