import React, { Component } from 'react';

import colorPicker from '../../utility/colorPicker';

export default class Summary extends Component {

    render() {
        const { backupConfig } = this.props;
        const statistics = backupConfig.statistics;

        return (
            <div className="summary">
                {
                    Object.keys(statistics).map((key, index)=> {
                        return (
                            <div className="item" style={{ width: 32 + "%", color: colorPicker.getColorWithKey(key)}} key={ index }>
                                <div className="title">{ key }</div>
                                <div className="value">{ statistics[key] }</div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

}