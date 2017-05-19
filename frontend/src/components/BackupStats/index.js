import React, { Component } from 'react';
import Chart from './Chart';
import Summary from './Summary';

const prepareDataForBar = (statistics) => {
    let ret = [];

    for(let name in statistics) {
        ret.push({
            name,
            value: statistics[name]
        })
    }

    return ret;
};

export default class BackupStats extends Component {

    render() {
        const { backupConfig } = this.props;
        const { statistics } = backupConfig;
        const barData = prepareDataForBar(statistics);

        return (
            <div className="backup-statistics">
                <Summary statistics={ statistics }/>
                <Chart data ={ barData }/>
            </div>
        )
    };
}