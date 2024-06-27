import * as CMA from "./cma/Cma.js";

let session = new CMA.Session();
let inputManager = CMA.InputManager.getDefaultInputManager(
    session.targetCamera
);
session.inputManager = inputManager;
session.start();
inputManager.init("desktop");
