import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";

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

        this.setupState(idleStateAttributes);
        this.setupState(hoveredStateAttributes);
        this.setupState(selectedStateAttributes);

        this.addEventListener("hoverdown", () => {
            this.setState("hovered");
        });
        this.addEventListener("hoverup", () => {
            this.setState("idle");
        });
        this.addEventListener("selectdown", () => {
            this.setState("selected");
        });
        this.addEventListener("selectup", () => {
            if (this.currentState == "selected") {
                this.setState("hovered");
                this.dispatchEvent({
                    type: "click",
                });
            }
        });

        this.setState("idle");
    }
}
