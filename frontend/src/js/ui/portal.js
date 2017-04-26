import React, { Component } from 'react';
import ReacDOM from 'react-dom';

// from http://stackoverflow.com/questions/28802179/how-to-create-a-react-modalwhich-is-append-to-body-with-transitions
export default class Portal extends Component {

    componentDidMount() {
        const p = this.props.portalId && document.getElementById(this.props.portalId);
        if(!p) {
            const p = document.createElement('div');
            p.id = this.props.portalId;
            document.body.appendChild(p);
        }
        this.portalElement = p;
        this.componentDidUpdate();
    }

    componentWillUnmount() {
        document.body.removeChild(this.portalElement);
    }

    componentDidUpdate() {
        React.render(<div {...this.props}>{ this.props.children }</div>, this.portalElement);
    }

}
