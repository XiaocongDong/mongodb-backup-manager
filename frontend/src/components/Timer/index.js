import React, { Component } from 'react';
import time from 'utility/time';


export default class Timer extends Component {

    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            remain: null
        };
        this.getRemain = this.getRemain.bind(this);
        this.updateRemain = this.updateRemain.bind(this);
    }

    componentDidMount() {
        this.timer = setInterval(this.updateRemain, 1000);
    }

    getRemain() {
        const endTime = this.props.endTime;
        const endDate = new Date(endTime);
        const now = new Date();

        return endDate - now;
    }

    updateRemain() {
        const remain = time.getTimeStringFromMilliseconds(this.getRemain());

        this.setState({
            remain
        })
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        const remain = this.state.remain;

        return (
            <span className="timer">
                { remain || ""}
            </span>
        )
    }
}