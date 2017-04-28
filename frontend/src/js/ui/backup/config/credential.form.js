//react
import React, { Component } from 'react';

//ui
import Form from '../../templates/form';
import Portal from '../../portal';
import ModalWrapper from '../../modal.wrapper';
import HistoryConnections from './historyConnections';

//utility
import input from '../../../utility/input';
import object from '../../../utility/object';
import backupConfigUtil from '../../../utility/backupConfig';
import { AUTHSTATES } from '../../../utility/constants';

//api
import databases from '../../../api/databases';

const getConnectionsHistory = () => {
    const connections = localStorage.getItem('connections');
    return JSON.parse(connections);
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
        this.state = {
          showHistory: false
        };
        this.connections = getConnectionsHistory();
    }

    createNewConnection(connection) {
        const id = connection.username? `${ connection.username }@${ connection.server}`: `${ connection.server }`;
        connection.id = id;
        if(this.connections == null) {
            this.connections = [];
        }

        const filteredConnections = object.filterArrWithKeyValue("id", id, this.connections);

        if(filteredConnections.length > 0) {
            object.updateArrWithKeyValue('id', id, this.connections, connection);
        }else {
            this.connections.push(connection);
        }

        localStorage.setItem('connections', JSON.stringify(this.connections));
    };


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
                this.createNewConnection(backupConfig);
                setDbsColls(data);
            })
            .catch( err  => {
                console.error(err);
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

    setCredentials(connectionId) {
        const connection = object.filterArrWithKeyValue("id", connectionId, this.connections);
        const {id, ...backupConfig} = connection;
        this.props.handleConfigChange(backupConfig);
    }

    toggleHistory() {
        this.setState({
            showHistory: !this.state.showHistory
        })
    }

    render() {
        const { backupConfig, authState } = this.props;
        const showHistory = this.state.showHistory;
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
                                        {
                                            this.connections && this.connections.length > 0 && key == 'server' &&
                                            (
                                                <div className="history">
                                                    <div className="text clickable" onClick={ this.toggleHistory.bind(this) }>recent connections</div>
                                                    {
                                                        showHistory &&
                                                        (
                                                            <Portal>
                                                                <ModalWrapper style={{ backgroundColor: 'transparent' }}>
                                                                    <HistoryConnections connections={ this.connections }
                                                                                        onClickClose={ this.toggleHistory.bind(this) }
                                                                                        onClickConnect={ this.setCredentials.bind(this) }
                                                                    />
                                                                </ModalWrapper>
                                                            </Portal>
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
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