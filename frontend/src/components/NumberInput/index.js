import React, { Component } from 'react';
import input from "utility/input";


export default class NumberInput extends Component {

    handleChange(event) {
        const { onChange } = this.props;
        event.preventDefault();
        const value = event.target.value;

        (onChange) && (onChange(value));
    }

    handleOnBlur(event) {
        const { onBlur } = this.props;
        event.preventDefault();
        let value = event.target.value;
        (input.isEmpty(value)) && (value = 0);
        (onBlur) && (onBlur(value));
    }

    render() {
        const { className, value } = this.props;

        return (
            <input type="number"
                   className= { className || "" }
                   disabled={ value === null }
                   onChange={ this.handleChange.bind(this) }
                   onBlur={this.handleOnBlur.bind(this) }
                   value={ value === null?"": value }
            />
        )
    }

}