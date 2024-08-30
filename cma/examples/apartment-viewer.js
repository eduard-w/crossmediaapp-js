import * as CMA from "../Cma.js";
import * as THREE from "three";
import ThreeMeshUI from "three-mesh-ui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';
import FontJSON from "./assets/fonts/Roboto-msdf.json";
import FontImage from "./assets/fonts/Roboto-msdf.png";

let session = new CMA.Session();
const worldScene = new THREE.Scene();
const guiScene = new THREE.Scene();
session.setWorldScene(worldScene);
session.setGuiScene(guiScene);

session.startPosition = new THREE.Vector3(0,0.5,0);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.castShadow = true;
worldScene.add(ambientLight);

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

const uiLabel = new ThreeMeshUI.Text({
	fontSize: 0.1,
	content: "\nApartments\n",
});
session.appMenu.add(uiLabel);
session.appMenu.set({
	height: 1.3
});

function getFloors(object) {
	let floors = [];
	object.traverse((obj) => {
		if (CMA.isObjectFloor(obj)) {
			floors.push(obj);
		}
	});
	return floors;
}

let apartmentScene = null;

function addApartmentButton(object) {
	const button = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
	button.add(new ThreeMeshUI.Text({ content: "Return to Start" }));
	button.addEventListener("click", (event) => {
		session.queueTeleport(session.startPosition);
		session.inputManager.toggleMenu();
	});
	session.appMenu.add(button);
	session.registerObjectInGui(button);
	return button;
}

const uiOptions = {
	width: 0.75,
	height: 0.375,
	padding: 0.05,
	justifyContent: "center",
	textAlign: "center",
	fontFamily: FontJSON,
	fontTexture: FontImage,
}

const apartment_path = "./cma/examples/assets/apartments/apartment1/apartment_1.gltf";
loadObject(apartment_path).then((gltf) => {
	apartmentScene = gltf.scene;
	addApartmentButton(apartmentScene);
	apartmentScene.traverse((obj) => {
		if (CMA.isObjectFloor(obj)) {
			obj.material.transparent = true;
			obj.material.opacity = 0.1;
		}
	
	});

	addTeleportButton(new THREE.Vector3(0,0.75,-2), "Enter Building", new THREE.Vector3(0,0.5,-4));
	addTeleportButton(new THREE.Vector3(2,0.75,-5), "Go Upstairs", new THREE.Vector3(0,4.5,-4));
	addTeleportButton(new THREE.Vector3(2,4.75,-5), "Go Downstairs", new THREE.Vector3(0,0.5,-4));

	loadApartment();
});

function addTeleportButton(position, text, teleportPosition) {
	let ui = new ThreeMeshUI.Block(uiOptions);
	ui.position.copy(position);
	let button = new CMA.Button(CMA.AppMenu.defaultButtonOptions);
	
	button.add(new ThreeMeshUI.Text({ content: text }));
	button.addEventListener("click", (event) => {
		session.queueTeleport(teleportPosition);
	});
	session.registerObjectInWorld(button);
	ui.add(button);
	apartmentScene.add(ui);
}

function loadApartment() {
	worldScene.add(apartmentScene);
	let currentFloors = getFloors(apartmentScene);
	for (let obj of currentFloors) {
		session.registerObjectInWorld(obj);
	}
}

session.addEventListener("started", (event) => {
	if (!(session.mode == "mobile-ar" || session.mode == "hmd-ar")) {
		// load env map
		new EXRLoader().load( './cma/examples/assets/env_maps/meadow_2_1k.exr', function ( texture ) {
			texture.mapping = THREE.EquirectangularReflectionMapping;
			worldScene.background = texture;
		} );
	}
});