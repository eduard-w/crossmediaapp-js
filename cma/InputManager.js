export class InputManager {
    constructor(object3d) {
        this.target = object3d;
        this.initDesktop = null;
        this.initHmd = null;
        this.initMobile = null;
        this.inputStates = {};
    }

    init(sessionMode) {
        switch (sessionMode) {
            case "desktop":
                this.initDesktop();
            case "hmd":
                this.initHmd();
            case "mobile":
                this.initMobile();
        }
    }

    static getDefaultInputManager(target) {
        let manager = new InputManager(target);

        manager.initDesktop = function () {
            const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

            document.addEventListener("mousedown", () => {
                document.body.requestPointerLock();
            });

            document.body.addEventListener("mousemove", (event) => {
                if (document.pointerLockElement === document.body) {
                    manager.target.rotation.x = clamp(
                        manager.target.rotation.x - event.movementY / 500,
                        -Math.PI / 2 + 0.01,
                        Math.PI / 2 - 0.01
                    );
                    manager.target.rotation.y -= event.movementX / 500;
                }
            });

            document.addEventListener("keydown", (event) => {
                manager.inputStates[event.code] = true;
            });

            document.addEventListener("keyup", (event) => {
                manager.inputStates[event.code] = false;
            });
        };
        manager.initHmd = function () {
            // TODO
        };
        manager.initMobile = function () {
            // TODO
        };

        return manager;
    }
}
