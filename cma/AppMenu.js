import ThreeMeshUI from "three-mesh-ui";
import * as CMA from "./Cma.js";

import FontJSON from "./examples/assets/fonts/Roboto-msdf.json";
import FontImage from "./examples/assets/fonts/Roboto-msdf.png";

export class AppMenu extends ThreeMeshUI.Block {
	constructor() {
		super(AppMenu.defaultOptions);
		this.add(
			new ThreeMeshUI.Text({
				content: "App Menu\n",
				fontSize: 0.1,
			})
		);
		this.buttonClose = AppMenu.getNewButtonClose();
		this.add(this.buttonClose);
		this.buttonQuit = AppMenu.getNewButtonQuit()
		this.add(this.buttonQuit);
	}

	static defaultOptions = {
		width: 1.3,
		height: 0.5,
		padding: 0.05,
		justifyContent: "center",
		textAlign: "center",
		fontFamily: FontJSON,
		fontTexture: FontImage,
	}

	static defaultButtonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: "center",
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075,
	};

	static getNewButtonClose() {
		const button = new CMA.Button(AppMenu.defaultButtonOptions);
		button.add(new ThreeMeshUI.Text({ content: "Close" }));
		button.addEventListener("click", (event) => {
			console.log("close button");
		});
		return button;
	}
	
	static getNewButtonQuit() {
		const button = new CMA.Button(AppMenu.defaultButtonOptions);
		button.add(new ThreeMeshUI.Text({ content: "Quit" }));
		button.addEventListener("click", (event) => {
			console.log("quit button");
		});
		return button;
	}
}