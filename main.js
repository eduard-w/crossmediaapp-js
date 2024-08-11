import * as CMA from "./cma/Cma.js";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


let session = new CMA.Session();

// TODO: edit scene in here
const worldScene = new THREE.Scene();
const guiScene = new THREE.Scene();

session.setWorldScene(worldScene);
session.setGuiScene(guiScene);

// light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
ambientLight.castShadow = true;
worldScene.add(ambientLight);

const shiba = "./public/shiba_model/scene.gltf";
const apartment = "./public/apartment_v4/apartment.gltf";

const objLoader = new GLTFLoader();
function loadObject(path) {
	objLoader.load(
		path,
		function (gltf) {
			worldScene.add(gltf.scene);
			session.raycastHelper.registerObjectInWorld(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error);
		}
	);
}

loadObject(apartment);

