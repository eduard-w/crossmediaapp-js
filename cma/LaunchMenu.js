export class LaunchMenu {
    constructor(rootNode) {
        this.container = document.createElement("div");
        LaunchMenu.stylizeContainer(this.container);
        rootNode.appendChild(this.container);

        this.desktopButton = this.newButton();
        this.desktopButton.textContent = "DESKTOP MODE";
        this.vrButton = this.newButton();
        this.arButton = this.newButton();

        if ("xr" in navigator) {
            navigator.xr
                .isSessionSupported("immersive-vr")
                .then((supported) => {
                    this.vrButton.textContent = supported
                        ? "VR MODE"
                        : "VR NOT SUPPORTED";
                    if (!supported) {
                        this.disableButton(this.vrButton);
                    }
                })
                .catch(() => {
                    console.warn(
                        "Exception when trying to call xr.isSessionSupported('immersive-vr')",
                        exception
                    );
                    this.vrButton.textContent = "VR NOT ALLOWED";
                });

            navigator.xr
                .isSessionSupported("immersive-ar")
                .then((supported) => {
                    this.arButton.textContent = supported
                        ? "AR MODE"
                        : "AR NOT SUPPORTED";
                    if (!supported) {
                        this.disableButton(this.arButton);
                    }
                })
                .catch(() => {
                    console.warn(
                        "Exception when trying to call xr.isSessionSupported('immersive-ar')",
                        exception
                    );
                    this.vrButton.textContent = "AR NOT ALLOWED";
                });
        } else {
            this.container.removeChild(this.vrButton);
            this.container.removeChild(this.arButton);
            this.errorButton = this.newButton();
            this.disableButton(this.errorButton);
            if (window.isSecureContext === false) {
                this.errorButton.textContent = "WEBXR NEEDS HTTPS";
            } else {
                this.errorButton.textContent = "WEBXR NOT AVAILABLE";
            }
        }
    }

    disableButton(button) {
        button.disabled = true;
        button.style.opacity = 0.35;
        button.onmouseenter = null;
        button.onmouseleave = null;
    }

    newButton() {
        const buttonDiv = document.createElement("div");
        LaunchMenu.stylizeDiv(buttonDiv);
        this.container.appendChild(buttonDiv);

        const button = document.createElement("button");
        LaunchMenu.stylizeButton(button);
        buttonDiv.appendChild(button);
        return button;
    }

    static stylizeContainer(element) {
        element.style.margin = "auto";
        element.style.width = "100%";
        element.style.position = "absolute";
        element.style.bottom = "20px";
        element.style.display = "flex";
        element.style.justifyContent = "center";
        element.style.alignItems = "center";
        element.style.gap = "10px";
    }

    static stylizeDiv(element) {
        element.style.display = "flex";
        element.style.alignItems = "center";
        element.style.justifyContent = "center";
    }

    static stylizeButton(element) {
        element.style.position = "relative";
        element.style.bottom = "auto";
        element.style.left = "auto";
        element.style.padding = "12px 6px";
        element.style.border = "1px solid #fff";
        element.style.borderRadius = "4px";
        element.style.background = "rgba(0,0,0,0.1)";
        element.style.color = "#fff";
        element.style.font = "normal 13px sans-serif";
        element.style.textAlign = "center";
        element.style.opacity = "0.5";
        element.style.outline = "none";
        element.style.zIndex = "999";
        element.onmouseenter = function () {
            element.style.opacity = "1.0";
        };
        element.onmouseleave = function () {
            element.style.opacity = "0.5";
        };
    }
}
