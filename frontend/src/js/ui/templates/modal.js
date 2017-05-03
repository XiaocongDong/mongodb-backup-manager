import React, { Component } from 'react';
import ModalWrapper from '../modal.wrapper';
import Portal from '../portal';
import colorPicker from '../../utility/colorPicker';


export default class Modal extends Component {

    constructor(props) {
        super(props);
        this.getIcon = this.getIcon.bind(this);
        this.onButtonClick = this.onButtonClick.bind(this);
    }

    getIcon(type) {
        switch (type) {
            case 'ok':
                return (<div className="icon"><i className="fa fa-check" aria-hidden={ true }></i></div>);
            case 'info':
                return (<div className="icon"><i className="fa fa-info" aria-hidden={ true }></i></div>);
            case 'caution':
                return (<div className="icon"><i className="fa fa-exclamation" aria-hidden={ true }></i></div>);
            case 'error':
                return (<div className="icon"><i className="fa fa-times" aria-hidden={ true }></i></div>);
        }
    }

    onButtonClick(button) {
        setTimeout(button.onClick, this.props.animationTime || 0);
    }

    render() {
        const props = this.props;
        const icon = this.getIcon(props.type);
        const title = (
            <div className="title">
                { props.title }
            </div>
        );
        const text = (
            <div className="text">
                { props.text }
            </div>
        );

        const buttons = props.buttons.map((button, index) => {
            return (
                <div
                    className="operation"
                    onClick={ this.onButtonClick.bind(this, button) }
                    key={ index }
                >
                    { button.text }
                </div>
            )
        });

        return (
            <Portal>
                <ModalWrapper>
                    <div className="modal">
                        <div
                            className="content"
                            style={ { backgroundColor: colorPicker.getColorWithType(props.type) } }
                        >
                            { icon }
                            { title }
                            { text }
                        </div>
                        <div className="operations">
                            { buttons }
                        </div>
                    </div>
                </ModalWrapper>
            </Portal>
        )
    }

}