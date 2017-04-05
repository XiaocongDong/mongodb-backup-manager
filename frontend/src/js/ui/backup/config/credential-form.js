import React, { Component } from 'react';
import input from '../../../utility/input';


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
        this.formFields = ["server", "port", "username", "password", "authDB"];
        this.requiredFields = ["server", "port", "authDB"]
    }

    handleAuthenticate() {
        let validated = true;
        const backupConfig = this.props.backupConfig;
        this.formFields.map(key => {
            const error = input.validateKey(key, backupConfig[key]);
            this.errors[key] = error;
            if(!input.isEmpty(error)) {
                validated = false;
            }
        });
        if(!validated) {
            this.forceUpdate();
            return;
        }
        // TODO authenticate the database
        this.props.handleNext();
    }

    onChange(key, event) {
        event.preventDefault();
        const value = event.target.value;
        this.errors[key] = input.validateKey(key, value);
        this.props.handleConfigChange({[key]: value});
    }

    render() {
        const backupConfig = this.props.backupConfig;
        const errors = this.errors;

        return (
            <div className="form credential-form">
                <div className="title">Backup Database Credential</div>
                <div className="content">
                    {
                        this.formFields.map((key, i) => {
                                const error = errors[key];
                                return (
                                    <div className="item" key={ i }>
                                        <label>
                                            { key }
                                            { this.requiredFields.includes(key) && <div className="required">*</div> }
                                        </label>
                                        <input className={"input-field" + ((error)? " error-input": "")}
                                               type = { key == "password"? "password": "text"}
                                               defaultValue={ backupConfig[key] }
                                               onChange={ this.onChange.bind(this, key)}
                                        />
                                        <div className="error-message">{ error }</div>
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