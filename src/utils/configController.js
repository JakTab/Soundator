import * as Store from 'electron-store';

class configController {
    constructor() {
        this.config = new Store();
    }

    set(varName, value) {
        this.config.set(varName, value);
    }

    get(varName) {
        return this.config.get(varName);
    }

    store() {
        return this.config.store;
    }

    clear() {
        this.config.clear();
    }

    checkIfUndefined(varName) {
        return this.config.get(varName) == undefined;
    }

    checkIfObjectOrString(varName) {
        if (typeof this.config.get(varName) === "object") {
            return this.config.get(varName).filePaths[0];
        } else if (typeof this.config.get(varName) === "string") {
            return this.config.get(varName);
        }
    }
}

export default configController;