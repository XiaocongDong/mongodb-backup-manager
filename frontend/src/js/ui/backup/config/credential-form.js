import React, { Component } from 'react';


export default class CredentialForm extends Component {

    constructor(props) {
        super(props);
        this.handleConnect = this.handleConnect.bind(this);
    }

    handleConnect(e) {
        e.preventDefault();

        const credential = {
            server: this.serverInput.value,
            port: this.portInput.value,
            username: this.usernameInput.value,
            password: this.passwordInput.value,
            authDB: this.authDBInput.value
        };

        this.props.saveData(credential);
        this.props.authenticate(credential);
    }

    render() {
        const backupConfig = this.props.backupConfig;

        return (
            <div className="form credential-form">
                <div className="title">Backup Database Credential</div>
                <div className="content">
                    <label>Server</label>
                    <input className="input-field"
                           type="text"
                           ref={ input => this.serverInput = input }
                           defaultValue={ backupConfig.server }>
                    </input>

                    <label>Port</label>
                    <input className="input-field"
                           type="text"
                           ref={ input => this.portInput = input }
                           defaultValue={ backupConfig.port }>
                    </input>

                    <label>Username</label>
                    <input className="input-field"
                           type="text"
                           ref={ input => this.usernameInput = input }
                           defaultValue = { backupConfig.username }>
                    </input>

                    <label>Password</label>
                    <input className="input-field"
                           type="password"
                           ref={ input => this.passwordInput = input }
                           defaultValue = { backupConfig.password }>
                    </input>

                    <label>Authentication Database</label>
                    <input className="input-field"
                           type="text"
                           ref={ input => this.authDBInput = input }
                           defaultValue={ backupConfig.authDB }>
                    </input>
                </div>
                <div className="footer">
                    <div className="button big yes button-middle" onClick={ this.handleConnect }>Connect to DB</div>
                </div>
            </div>
        )
    }
}