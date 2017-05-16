import React, { Component } from 'react';
import ReactDOM from 'react-dom';

// from http://stackoverflow.com/questions/28802179/how-to-create-a-react-modalwhich-is-append-to-body-with-transitions
export default class Portal extends Component {

    constructor(props) {
        super(props);
        this.portalId = props.portalId || "portal-component";
        this.clear = this.props.clear != false;
    }

    componentDidMount() {
        let p = this.portalId && document.getElementById(this.portalId);
        if(!p) {
            p = document.createElement('div');
            p.id = this.portalId;
            document.body.appendChild(p);
        }
        this.portalElement = p;
        this.componentDidUpdate();
    }

    componentWillUnmount() {
        document.body.removeChild(this.portalElement);
    }

    componentDidUpdate() {
        ReactDOM.render(<div>{ this.props.children }</div>, this.portalElement);
    }

    render() {
        return null;
    }

}
