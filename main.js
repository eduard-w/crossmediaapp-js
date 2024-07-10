import * as CMA from "./cma/Cma.js";
import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";

import FontJSON from "./public/fonts/Roboto-msdf.json";
import FontImage from "./public/fonts/Roboto-msdf.png";

let session = new CMA.Session("vr-6dof");
session.start();

// window.addEventListener('touchstart', (event) => {
//     selectState = true;
//     mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
// });

// window.addEventListener('touchend', () => {
//     selectState = false;
//     mouse.x = null;
//     mouse.y = null;
// });

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

const buttonOptions = {
    width: 0.4,
    height: 0.15,
    justifyContent: "center",
    offset: 0.05,
    margin: 0.02,
    borderRadius: 0.075,
};

const button1 = new CMA.Button(buttonOptions);
const button2 = new CMA.Button(buttonOptions);

button1.add(new ThreeMeshUI.Text({ content: "restart app" }));

button2.add(new ThreeMeshUI.Text({ content: "close menu" }));

button1.addEventListener("click", (event) => {
    console.log("button press 1");
});

button2.addEventListener("click", (event) => {
    console.log("button press 2");
});

container.add(button1, button2);
session.inputManager.raycastTargets.push(button1, button2);
