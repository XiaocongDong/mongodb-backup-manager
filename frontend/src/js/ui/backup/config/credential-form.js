import React, { Component } from 'react';
import inputValidator from '../../../utility/input-validator';


export default class CredentialForm extends Component {

    constructor(props) {
        super(props);
        const backupConfig = props.backupConfig;
        this.state = {
            server: backupConfig.server || "server",
            port: backupConfig.port || 27017,
            username: backupConfig.username,
            password: backupConfig.password,
            authDB: backupConfig.authDB || "admin"
        };
        this.errorMessages = {
            server: null,
            port: null,
            username: null,
            password: null,
            authDB: null
        };
        this.validate = this.validate.bind(this);
        this.getError = this.getError.bind(this);
        this.setError = this.setError.bind(this);
        this.getCredential = this.getCredential.bind(this);
    }

    handleAuthenticate() {
        const credential = this.getCredential();
        for(let key in credential) {
            const errorMessage = this.validate(key, credential[key]);
            if(errorMessage) {
                this.setError(key, errorMessage);
                return;
            }
        }
        // TODO authenticate the database
        this.props.saveData(credential);
        this.props.onClickNext();
    }

    onChange(key, event) {
        event.preventDefault();
        const value = event.target.value;

        const errorMessage = this.validate(key, value);
        console.log(errorMessage);
        errorMessage? this.setError(key, errorMessage): this.setError(key, null);

        this.setState({
            [key]: value
        });
    }

    getError(key) {
        return this.errorMessages[key];
    }

    setError(key, errorMessage) {
        this.errorMessages[key] = errorMessage;
    }

    getCredential() {
        const {server, port, username, password, authDB} = this.state;
        return {server, port, username, password, authDB};
    }

    validate(key, value) {
        switch (key) {
            case "server":
                if(inputValidator.isEmpty(value)) {
                    return 'server must be specified';
                }
                break;
            case "port":
                if(inputValidator.isEmpty(value)) {
                    return 'port must be specified';
                }
                if(!inputValidator.isInteger(value)) {
                    return 'port must be a number';
                }
                break;
            case "username":
                break;
            case "password":
                break;
            case "authDB":
                if(inputValidator.isEmpty(value)) {
                    return 'authentication database must be specified';
                }
                break;
            default:
                break
        }
    }

    render() {
        const data = this.state;

        return (
            <div className="form credential-form">
                <div className="title">Backup Database Credential</div>
                <div className="content">
                    {
                        Object.keys(data).filter(key => !key.includes("Error"))
                            .map((key, i) => {
                                const errorMessage = this.getError(key);
                                return (
                                    <div className="item" key={ i }>
                                        <label>{ key }</label>
                                        {
                                            (errorMessage) && (
                                                <div className="error-message">
                                                    { errorMessage }
                                                </div>
                                            )
                                        }
                                        <input className={"input-field" + ((errorMessage)? " error-input": "")}
                                               type = { key == "password"? "password": "text"}
                                               defaultValue={ data[key] }
                                               onChange={ this.onChange.bind(this, key)}/>
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