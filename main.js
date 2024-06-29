import * as CMA from "./cma/Cma.js";
import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";

import FontJSON from "./public/fonts/Roboto-msdf.json";
import FontImage from "./public/fonts/Roboto-msdf.png";

let session = new CMA.Session();
let inputManager = CMA.InputManager.getDefaultInputManager(
    session.targetCamera
);
session.inputManager = inputManager;
session.start();
inputManager.init("desktop");

const container = new ThreeMeshUI.Block({
    width: 1.3,
    height: 0.5,
    padding: 0.05,
    justifyContent: "center",
    textAlign: "center",
    fontFamily: FontJSON,
    fontTexture: FontImage,
});
container.add(
    new ThreeMeshUI.Text({
        content: "App Menu\n",
        fontSize: 0.1,
    }),

    new ThreeMeshUI.Text({
        content:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        fontSize: 0.06,
    })
);
container.position.set(0, 0, -1);
session.targetCamera.add(container);
