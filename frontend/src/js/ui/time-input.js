import React, { Component } from "react";
import NumberInput from "./number-input";


export default class TimeInput extends Component {

    constructor(props) {
        super(props);
    }

    handleChange(key, value) {
        this.values[key] = value;
        this.props.onChange(this.values);
    }

    handleOnBlur(key, value) {
        this.values[key] = value;
        this.props.onChange(this.values);
    }

    render() {
        let { errors, values} = this.props;
        this.values = values || {"days": null, "hours": null, "minutes": null, "seconds": null};

        const timeDOM = Object.keys(this.values).map((key, i) => {
            return (
                <div className="time-item" key={ i }>
                    <NumberInput className={ "input-field" + (errors[key] ? " error-input": "") }
                                 value={ this.values[key] }
                                 onBlur={ this.handleOnBlur.bind(this, key)}
                                 onChange={ this.handleChange.bind(this, key)}
                    />
                    <div className="name">{ key }</div>
                    <div className="error-message">{errors[key]}</div>
                </div>
            )
        });

        return (
            <div>
                <div className="time-input-wrapper">
                { timeDOM }
                </div>
            </div>
        )
    }
}
