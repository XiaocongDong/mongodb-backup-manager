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
        this.requireKeys = ["server", "port", "authDB"];
        this.validate = this.validate.bind(this);
    }

    handleAuthenticate() {
        const credential = this.state;
        for(let key in credential) {
            const errorMessage = this.validate(key, credential[key]);
            if(errorMessage) {
                this.errorMessages[key] = errorMessage;
                return;
            }
        }
        // TODO authenticate the database
        this.props.onClickNext();
    }

    onChange(key, event) {
        event.preventDefault();
        const value = event.target.value;
        this.errorMessages[key] = this.validate(key, value);
        this.setState({
            [key]: value
        });
        (this.props.handleChange) && (this.props.handleChange(key, value));
    }

    validate(key, value) {
        if(inputValidator.isEmpty(value) && this.requireKeys.includes(key)) {
            return `${ key } must be specified`;
        }
        switch (key) {
            case "server":
                break;
            case "port":
                if(!inputValidator.isInteger(value)) {
                    return 'port must be a number';
                }
                break;
            case "username":
                break;
            case "password":
                break;
            case "authDB":
                break;
            default:
                break
        }
        return null;
    }

    render() {
        const data = this.state;
        const errorMessages = this.errorMessages;

        return (
            <div className="form credential-form">
                <div className="title">Backup Database Credential</div>
                <div className="content">
                    {
                        Object.keys(data).filter(key => !key.includes("Error"))
                            .map((key, i) => {
                                const errorMessage = errorMessages[key];
                                return (
                                    <div className="item" key={ i }>
                                        <label>
                                            { key }
                                            { this.requireKeys.includes(key) && <div className="required">*</div> }
                                        </label>
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