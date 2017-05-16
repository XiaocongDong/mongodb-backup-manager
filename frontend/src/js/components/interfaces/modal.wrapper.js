import React, { Component } from 'react';


export default class ModalWrapper extends Component {

    render() {
        const props = this.props;
        const { children, ...overlayProps } = props;
        return (
            <div id="modal-wrapper">
                <div className="overlay"  {...overlayProps} >
                </div>
                { children }
            </div>
        )
    }
}