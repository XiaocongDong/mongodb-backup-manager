class BackupError {

    constructor(message) {
        this._messages = [message];
    }

    addErrorMessage(message) {
        this._messages.push(message);
    }

    get message() {

    }
}