import React, { Component } from 'react';
import Form from '../../templates/form';
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
        if(!input.validateKeys(this.formFields, this.errors, this.props.backupConfig)) {
            this.forceUpdate();
            return;
        }
        // TODO authenticate the database
        this.props.handleNext();
    }

    handleConfigChange(key, event) {
        event.preventDefault();
        const value = event.target.value;
        this.errors[key] = input.validateKey(key, value);
        this.props.handleConfigChange({[key]: value});
    }

    render() {
        const backupConfig = this.props.backupConfig;
        const errors = this.errors;
        const title = "Backup Database Credential";
        const items = this.formFields.map((key) => {
                                const error = errors[key];
                                return (
                                    <div>
                                        <label>
                                            { key }
                                            { this.requiredFields.includes(key) && <div className="required">*</div> }
                                        </label>
                                        <input className={"input-field" + ((error)? " error-input": "")}
                                               type = { key == "password"? "password": "text"}
                                               defaultValue={ backupConfig[key] }
                                               onChange={ this.handleConfigChange.bind(this, key)}
                                        />
                                        <div className="error-message">{ error }</div>
                                    </div>)
                            });
        const buttons = [(<div className="button big yes button-middle" onClick={ this.handleAuthenticate.bind(this)} key={0}>Connect to DB</div>)];

        return (
            <Form
                className="credential-form"
                title={ title }
                items={ items }
                buttons={buttons }
            >
            </Form>
        )
    }
}