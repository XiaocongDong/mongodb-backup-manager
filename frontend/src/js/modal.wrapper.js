import React, { Component } from 'react';


export default class ModalWrapper extends Component {

    render() {
        return (
            <div id="modal-wrapper">
                <div className="overlay"  onClick={ this.props.onClickOverlay }>
                </div>
                { this.props.children }
            </div>
        )
    }
}