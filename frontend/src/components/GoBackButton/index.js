import React, { Component } from 'react';
import { hashHistory } from 'react-router';


export default class GoBackButton extends Component {

    render() {

        return (
            <div className="go-back-button clickable" onClick={ () => hashHistory.push('/')}>
            </div>
        )

    }

}