import React, { Component } from "react";
import NumberInput from "components/NumberInput";
import timeUtil from "utility/time";


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
        this.values = values || timeUtil.getTime(null, null, null, null);
        const width = 100 / Object.keys(this.values).length;

        const timeDOM = Object.keys(this.values).map((key, i) => {
            return (
                <div className="time-item" key={ i } style={ { width: width + "%" } }>
                    <NumberInput className={ "input-field" + (errors[key] ? " error-input": "") }
                                 value={ this.values[key] }
                                 onBlur={ this.handleOnBlur.bind(this, key)}
                                 onChange={ this.handleChange.bind(this, key)}
                    />
                    <div className="error-message">{errors[key]}</div>
                    <div className="name">{ key }</div>
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
