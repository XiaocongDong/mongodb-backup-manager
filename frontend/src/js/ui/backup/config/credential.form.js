//react
import React, { Component } from 'react';

//ui
import Form from '../../templates/form';
import modal from './modal';

//utility
import input from '../../../utility/input';
import backupConfigUtil from '../../../utility/backupConfig';


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
    }

    handleAuthenticate() {
        const errors = this.errors;
        const backupConfig = this.props.backupConfig;
        const keys = backupConfigUtil.credentialKeys;
        if(!input.validateKeys(keys, errors, backupConfig)) {
            this.forceUpdate();
            return;
        }
        modal.create();
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
        const { backupConfig } = this.props;
        const errors = this.errors;
        const requiredKeys = backupConfigUtil.requiredKeys;
        const uiKeys = backupConfigUtil.uiKeys;
        const title = "Backup Database Credential";
        const items = backupConfigUtil.credentialKeys.map((key) => {
                                const error = errors[key];
                                return (
                                    <div>
                                        <label>
                                            { uiKeys[key] }
                                            { requiredKeys.includes(key) && <div className="required">*</div> }
                                        </label>
                                        <input className={"input-field" + ((error)? " error-input": "")}
                                               type = { key == "password"? "password": "text"}
                                               defaultValue={ backupConfig[key] }
                                               onChange={ this.handleConfigChange.bind(this, key)}
                                        />
                                        <div className="error-message">{ error }</div>
                                    </div>)
                            });
        const buttons = [(<div className="button big yes button-middle" onClick={ this.handleAuthenticate.bind(this)}>Connect to DB</div>)];

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