import React, { Component } from 'react';


export default class DatabaseCredential extends Component {

    constructor(props) {
        super(props);
        this.fieldDefaultValues = {
            server: 'localhost',
            port: 27017,
            authDB: 'admin'
        };
        this.handleClickNext.bind(this);
    }

    handleClickNext(e) {
        e.preventDefault();

        const data = {
            server: this.serverInput.value,
            port: this.portInput.value,
            username: this.usernameInput.value,
            password: this.passwordInput.value,
            authDB: this.authDBInput.value
        };

        this.props.authenticate(data);
    }

    render() {
        return (
            <div>
                <div className="form-title">Backup Database Credential</div>
                <div className="form-content">
                    <label>Server</label>
                    <input type="text"
                           ref={ input => this.serverInput = input }
                           defaultValue={ this.fieldDefaultValues.server }>
                    </input>

                    <label>Port</label>
                    <input type="text"
                           ref={ input => this.portInput = input }
                           defaultValue={ this.fieldDefaultValues.port }>
                    </input>

                    <label>Username</label>
                    <input type="text"
                           ref={ input => this.usernameInput = input }>
                    </input>

                    <label>Password</label>
                    <input type="password"
                           ref={ input => this.passwordInput = input }>
                    </input>

                    <label>Authentication Database</label>
                    <input type="text"
                           ref={ input => this.authDBInput = input }
                           defaultValue={ this.fieldDefaultValues.authDB }>
                    </input>
                    <div className="button big yes connect-to-db" onClick={ this.handleClickNext }>Connect to DB</div>
                </div>
            </div>
        )
    }
}