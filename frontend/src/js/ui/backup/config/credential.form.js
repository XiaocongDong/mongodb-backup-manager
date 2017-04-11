//react
import React, { Component } from 'react';

//ui
import Form from '../../templates/form';

//utility
import input from '../../../utility/input';
import backupConfigUtil from '../../../utility/backupConfig';

//api
import databases from '../../../api/databases';

const STATES = {
    AUTHENTICATING: Symbol(),
    UNAUTHENTICATED: Symbol(),
    AUTHENTICATED: Symbol()
};

export default class CredentialForm extends Component {

    constructor(props) {
        super(props);
        this.errors = {
            server: null,
            port: null,
            username: null,
            password: null,
            authDB: null,
            authErr: null,
        };
        this.state = { auth: STATES.UNAUTHENTICATED };
    }

    handleAuthenticate() {
        if(this.state.auth == STATES.AUTHENTICATING) {
            return;
        }

        const errors = this.errors;
        const backupConfig = this.props.backupConfig;
        const setDbsColls = this.props.setDbsColls;
        const keys = backupConfigUtil.credentialKeys;

        if(!input.validateKeys(keys, errors, backupConfig)) {
            this.forceUpdate();
            return;
        }

        this.setState({ auth: STATES.AUTHENTICATING });
        databases.getAvailableDBs(backupConfig)
            .then(({ data }) => {
                if( data.length == 0) {
                    errors.authErr = `no available backup database in ${ backupConfig.server } this user`;
                    this.setState({ auth: STATES.UNAUTHENTICATED });
                    return;
                }

                this.setState({ auth: STATES.AUTHENTICATED });
                setDbsColls(data);
            })
            .catch(({ response }) => {
                errors.authErr = response.data.message;
                this.setState({ auth: STATES.UNAUTHENTICATED });
               // console.log(response);
            });
        // TODO authenticate the database
        // this.props.handleNext();
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
        const auth = this.state.auth;
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
        const buttons = [
            (
                <div
                    className={ "button big yes button-middle" + ((auth === STATES.AUTHENTICATING)? " button-waiting": "") }
                    onClick={ this.handleAuthenticate.bind(this)}
                >
                    { auth == STATES.AUTHENTICATING? "Connecting": "Connect to DB" }
                </div>)
        ];

        return (
            <Form
                className="credential-form"
                title={ title }
                items={ items }
                buttons={ buttons }
                error={ errors.authErr }
            >
            </Form>
        )
    }
}