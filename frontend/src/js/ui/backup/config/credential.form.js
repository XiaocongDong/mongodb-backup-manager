//react
import React, { Component } from 'react';

//ui
import Form from '../../templates/form';

//utility
import input from '../../../utility/input';
import backupConfigUtil from '../../../utility/backupConfig';
import { AUTHSTATES } from '../../../utility/constants';

//api
import databases from '../../../api/databases';

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
    }

    handleAuthenticate() {
        const { authState, setAuthState, backupConfig, setDbsColls, handleNext } = this.props;
        const errors = this.errors;
        const keys = backupConfigUtil.credentialKeys;

        if(authState == AUTHSTATES.AUTHENTICATING) {
            return;
        }

        if(authState == AUTHSTATES.AUTHENTICATED) {
            handleNext();
            return;
        }

        if(!input.validateKeys(keys, errors, backupConfig)) {
            this.forceUpdate();
            return;
        }

        setAuthState(AUTHSTATES.AUTHENTICATING);

        databases.getAvailableDBs(backupConfig)
            .then( ( { data } ) => {

                if( data.length == 0) {
                    errors.authErr = `no available backup database in ${ backupConfig.server } this user`;
                    setAuthState(AUTHSTATES.UNAUTHENTICATED);
                    return;
                }

                setAuthState(AUTHSTATES.AUTHENTICATED);
                setDbsColls(data);
            })
            .catch( ({ response })  => {
                errors.authErr = response.data.message;
                setAuthState(AUTHSTATES.UNAUTHENTICATED);
            });
    }

    handleConfigChange(key, event) {
        event.preventDefault();
        const value = event.target.value;
        this.props.setAuthState(AUTHSTATES.UNAUTHENTICATED);
        this.errors[key] = input.validateKey(key, value);
        this.props.handleConfigChange({[key]: value});
    }

    render() {
        const { backupConfig, authState } = this.props;
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
        const buttons = [(
                <div
                    className={ "button big yes button-middle" + ((authState == AUTHSTATES.AUTHENTICATING)? " button-waiting": "") }
                    onClick={ this.handleAuthenticate.bind(this)}
                >
                    { authState == AUTHSTATES.AUTHENTICATING? "Connecting": "Connect to DB" }
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