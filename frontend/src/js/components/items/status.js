import React, { Component } from 'react';

import colorPicker from 'utility/colorPicker';

export default class Status extends Component {

    render() {
        const {status, showBall=true, showText=true} = this.props;
        const color = colorPicker.getColorWithStatus(status);

        return (
            <div className="status">
                {
                    (showBall) && <div className="ball" style={ { borderColor: color } }></div>
                }
                {
                    (showText) && <div className="text" style={ { color } }>{ status }</div>
                }
            </div>
        )
    }
}