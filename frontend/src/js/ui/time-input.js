import React, { Component } from "react";
import inputValidator from "../utility/input-validator";

const ErrorMessagesDOM = (props) => {
    const { errorMessages } = props;

    return (
        <div>
            {
                Object.keys(errorMessages).filter(key => errorMessages[key] !== null)
                    .map((key, i) => {
                        return (
                            <div className="error-message" key={ i }>
                                { errorMessages[key] }
                            </div>
                        )
                    })
            }
        </div>
    )
};

export default class TimeInput extends Component {

    constructor(props) {
        super(props);
        this.state = {
            days: (props && props.days) || 0,
            hours: (props && props.hours) || 0,
            minutes: (props && props.minutes) || 0,
            seconds: (props && props.seconds) || 0,
            daysError: false,
            hoursError: false,
            minutesError: false,
            secondsError: false
        };
        this.errorMessages = {
            days: null,
            hours: null,
            minutes: null,
            seconds: null
        };
        this.timeScope = {
            days: {
                min: 0
            },
            hours: {
                min: 0,
                max: 24
            },
            minutes: {
                min: 0,
                max: 60
            },
            seconds: {
                min: 0,
                max: 60
            }
        };
        this.inputs = {};

        this.getError = this.getError.bind(this);
        this.setError = this.setError.bind(this);
    }

    getError(key) {
        return this.errorMessages[key];
    }

    setError(key, error) {
        this.props.onErrorChange(key, error);
        this.errorMessages[key] = error;
    }

    handleOnBlur(key) {
        let value = this.inputs[key].value;
        if(inputValidator.isEmpty(value)) {
            value = 0;
            this.setState({
                [key]: value
            })
        }
        this.props.onChange(key, value)
    }

    handleOnChange(key, event) {
        const value = event.target.value;
        this.validate(key, value);
        this.setState({
            [key]: value
        })
    }

    validate(key, value) {
        if(!inputValidator.isEmpty(value) && !inputValidator.isInteger(value)) {
            return this.setError(key, `${ key } must be integer`)
        }else{
            const { min, max } = this.timeScope[key];
            const result = inputValidator.checkScope(value, min, max);
            if(result < 0) {
                return this.setError(key, `${ key } must >= ${ min }`)
            }
            if(result > 0) {
                return this.setError(key, `${ key } must <= ${ max }`)
            }
        }
        this.setError(key, null);
    }

    render() {
        const data = this.state;
        const errorMessages = this.errorMessages;

        const timeDOM = Object.keys(data).filter(key => !key.includes("Error")).map((key, i) => {
            // console.log(key, data[key]);
            const inputs = {
                onBlur: this.handleOnBlur.bind(this, key),
                onChange: this.handleOnChange.bind(this, key)
            };

            // console.log(key, data[key + "Error"]);
            return (
                <div className="time-item" key={ i }>
                    <input type="number"
                           { ...inputs }
                           value={ data[key] }
                           ref={ input => this.inputs[key] = input}
                           className={ "input-field" + (this.getError(key) ? " error-input": "") }/>
                    <div className="name">{ key }</div>
                </div>
            )
        });

        return (
            <div>
                <ErrorMessagesDOM errorMessages={ errorMessages }/>
                <div className="time-input-wrapper">
                { timeDOM }
                </div>
            </div>
        )
    }
}
