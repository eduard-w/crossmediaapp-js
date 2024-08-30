import * as CMA from "../Cma.js";
import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

let session = new CMA.Session();
//session.targetCamera.position.setComponent(2,4);
const worldScene = new THREE.Scene();
const guiScene = new THREE.Scene();
session.setWorldScene(worldScene);
session.setGuiScene(guiScene);

session.startPosition = new THREE.Vector3(0,2,2);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 4);
ambientLight.castShadow = true;
worldScene.add(ambientLight);

// models
let chairs = [];
let currentChairIndex = 0;
let currentChair = null;

const objLoader = new GLTFLoader();
async function loadObject(path) {
	return new Promise((res, rej) => {
		objLoader.load(
			path,
			(gltf) => {res(gltf);},
			undefined,
			(error) => {rej(error);}
		);
	});
}

const chairContainer = new THREE.Mesh(
	new THREE.BoxGeometry(1, 1, 1), 
	new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 })
);
chairContainer.position.setComponent(1,0.5);
const wireframeMesh = new THREE.LineSegments(
	new THREE.EdgesGeometry(chairContainer.geometry),
	new THREE.LineBasicMaterial({ color: 0xff0000 })
);
wireframeMesh.raycast = () => {};
worldScene.add(chairContainer);
session.registerObjectInWorld(chairContainer);

function setChair(index) {
	if (currentChair) {
		chairContainer.remove(currentChair);
	}
	currentChair = chairs[index];
	chairContainer.add(currentChair);
	updateLabel();
}

const antique_chair = "./cma/examples/assets/antique_chair/scene.gltf";
const rustic_chair = "./cma/examples/assets/rustic_chair/scene.gltf";
const victorian_chair = "./cma/examples/assets/victorian_chair/scene.gltf";

for (let path of [antique_chair,rustic_chair,victorian_chair]) {
	loadObject(path).then((gltf) => {
		let obj = gltf.scene;
		// resize
		let box = new THREE.Box3().setFromObject(obj);
		obj.height = box.max.y - box.min.y;
		obj.scale.set(1/obj.height,1/obj.height,1/obj.height);
		box = new THREE.Box3().setFromObject(obj);
		obj.height = box.max.y - box.min.y;
		chairs.push(obj);
		
		switch(path) {
			case antique_chair:
				obj.name = "Antique Chair";
				obj.rotateY(Math.PI);
				obj.position.setComponent(2,0.75);
				obj.position.setComponent(1,-0.5);
				break;
			case rustic_chair:
				obj.name = "Rustic Chair";
				obj.position.setComponent(2,1.25);
				break;
			case victorian_chair:
				obj.name = "Victorian Chair";
				obj.position.setComponent(1,-0.5);
				setChair(0);
				break;
		}	
	});
}

const floorMesh = new THREE.Mesh( 
	new THREE.PlaneGeometry(10,10),
	new THREE.MeshBasicMaterial({
		color: 0xaaaaaa,
		transparent: true,
		opacity: 0.5
	})
);
floorMesh.name = "scenefloor";
floorMesh.lookAt(0,100,0);
worldScene.add(floorMesh);
session.registerObjectInWorld(floorMesh);

const uiLabel = new ThreeMeshUI.Text({
	fontSize: 0.1,
});
function updateLabel() {
	uiLabel.set({
		content: "\n\n" + currentChair.name + "\n" + "Chair Index: " + Math.abs(currentChairIndex % 3) + "\n"
	});
}

const buttonPrev = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
buttonPrev.add(new ThreeMeshUI.Text({ content: "previous" }));
buttonPrev.addEventListener("click", (event) => {
	currentChairIndex-=1;
	setChair(Math.abs(currentChairIndex % 3));
});

const buttonNext = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
buttonNext.add(new ThreeMeshUI.Text({ content: "next" }));
buttonNext.addEventListener("click", (event) => {
	currentChairIndex+=1;
	setChair(Math.abs(currentChairIndex % 3));
});

let interactionMode = "rotate";
const buttonRotateMode = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
buttonRotateMode.add(new ThreeMeshUI.Text({ content: "rotate" }));
const buttonTranslateMode = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
buttonTranslateMode.add(new ThreeMeshUI.Text({ content: "translate" }));

buttonRotateMode.addEventListener("click", (event) => {
	interactionMode = "rotate";
	buttonRotateMode.setState("selected");
	buttonTranslateMode.setState("idle");
});
buttonTranslateMode.addEventListener("click", (event) => {
	interactionMode = "translate";
	buttonTranslateMode.setState("selected");
	buttonRotateMode.setState("idle");
});
const buttonHoverUp = function() {
	if (this.currentState == "hovered") {
		this.setState("idle");
	}
}
const buttonHoverDown = function() {
	if (this.currentState == "idle") {
		this.setState("hovered");
	}
}
buttonRotateMode.removeEventListener("hoverup", buttonRotateMode._hoverup);
buttonRotateMode.addEventListener("hoverup", buttonHoverUp);
buttonRotateMode.removeEventListener("hoverdown", buttonRotateMode._hoverdown);
buttonRotateMode.addEventListener("hoverdown", buttonHoverDown);
buttonTranslateMode.removeEventListener("hoverup", buttonTranslateMode._hoverup);
buttonTranslateMode.addEventListener("hoverup", buttonHoverUp);
buttonTranslateMode.removeEventListener("hoverdown", buttonTranslateMode._hoverdown);
buttonTranslateMode.addEventListener("hoverdown", buttonHoverDown);
buttonRotateMode.setState("selected");

session.appMenu.add(uiLabel);
session.appMenu.add(buttonPrev);
session.registerObjectInGui(buttonPrev);
session.appMenu.add(buttonNext);
session.registerObjectInGui(buttonNext);
session.appMenu.add(buttonRotateMode);
session.registerObjectInGui(buttonRotateMode);
session.appMenu.add(buttonTranslateMode);
session.registerObjectInGui(buttonTranslateMode);
session.appMenu.set({
	height: 1.3
});

let chairSelected = false;
session.addEventListener("started", (event) => {

	if (session.mode == "mobile-ar" || session.mode == "hmd-ar") {
		worldScene.remove(floorMesh);
		session.unregisterObjectInWorld(floorMesh);
	} else {
		// load env map
		new EXRLoader().load( './cma/examples/assets/env_maps/photo_studio_broadway_hall_1k.exr', function ( texture ) {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			worldScene.background = texture;
		});		
	}
	session.inputManager.addEventListener("selectup", (event) => {
		if (chairSelected) {
			chairSelected = false;
		}
	});
	session.inputManager.addEventListener("selectmove", (event) => {
		if (chairSelected && interactionMode == "rotate") {
			let rotation = new THREE.Euler();
			rotation.setFromQuaternion(event.movement, "YXZ");
			chairContainer.rotation.y -= rotation.y*2;			
		}
	});
	session.addEventListener("update", (event) => {
		if (chairSelected && interactionMode == "translate") {
			let newPosition = null;
			if (session.mode == "hmd-vr" || session.mode == "hmd-ar") {
				newPosition = session.inputManager.activeController.position.clone();
				newPosition.addScaledVector(session.inputManager.activeController.getWorldDirection(new THREE.Vector3()).normalize(), -2);
			} else {
				newPosition = session.targetCamera.position.clone();
				newPosition.addScaledVector(session.targetCamera.getWorldDirection(new THREE.Vector3()).normalize(), 2);
			}
			chairContainer.position.copy(newPosition);
		}
	});
});

chairContainer.addEventListener("hoverdown", (event) => {
	chairContainer.add(wireframeMesh);
});
chairContainer.addEventListener("hoverup", (event) => {
	chairContainer.remove(wireframeMesh);
});
chairContainer.addEventListener("selectdown", (event) => {
	chairSelected = true;
});