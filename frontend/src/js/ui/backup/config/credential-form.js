import React, { Component } from 'react';
import inputValidator from '../../../utility/input-validator';


export default class CredentialForm extends Component {

    constructor(props) {
        super(props);
        this.errors = {
            server: null,
            port: null,
            username: null,
            password: null,
            authDB: null
        };
        this.credentials = {
            server: true,
            port: true,
            username: false,
            password: false,
            authDB: true
        };
    }

    handleAuthenticate() {
        // TODO authenticate the database
        this.props.handleNext();
    }

    onChange(key, event) {
        event.preventDefault();
        const value = event.target.value;
        this.errors[key] = inputValidator.validate(key, value);
        this.props.handleConfigChange({[key]: value});
    }

    render() {
        const backupConfig = this.props.backupConfig;
        const errors = this.errors;
        const credentialKeys = Object.keys(this.credentials);

        return (
            <div className="form credential-form">
                <div className="title">Backup Database Credential</div>
                <div className="content">
                    {
                        credentialKeys.map((key, i) => {
                                const error = errors[key];
                                return (
                                    <div className="item" key={ i }>
                                        <label>
                                            { key }
                                            { this.credentials[key] && <div className="required">*</div> }
                                        </label>
                                        {
                                            (error) && (
                                                <div className="error-message">
                                                    { error }
                                                </div>
                                            )
                                        }
                                        <input className={"input-field" + ((error)? " error-input": "")}
                                               type = { key == "password"? "password": "text"}
                                               defaultValue={ backupConfig[key] }
                                               onChange={ this.onChange.bind(this, key)}
                                        />
                                    </div>)
                            })
                    }
                </div>
                <div className="footer">
                    <div className="button big yes button-middle" onClick={ this.handleAuthenticate.bind(this) }>Connect to DB</div>
                </div>
            </div>
        );
    }
}