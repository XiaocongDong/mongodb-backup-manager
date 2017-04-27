import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// from http://stackoverflow.com/questions/28802179/how-to-create-a-react-modalwhich-is-append-to-body-with-transitions
export default class Portal extends Component {

    componentDidMount() {
        let p = this.props.portalId && document.getElementById(this.props.portalId);
        if(!p) {
            p = document.createElement('div');
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
        const { portalId, ...rest } = this.props;
        ReactDOM.render(<div {...rest}>{ this.props.children }</div>, this.portalElement);
    }

    render() {
        return null;
    }

}
