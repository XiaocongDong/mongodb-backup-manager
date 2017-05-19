import React, { Component } from 'react';

export default class Summary extends Component {

    render() {
        const statistics = this.props.statistics;

        return(
            <div className="backup-statistics-summary">
                {
                    Object.keys(statistics).map((k, index) => {
                        return (
                                    <div className="item" key={ index }>
                                        <div className="text">
                                            { k }
                                        </div>
                                        <div className="number">
                                            { statistics[k] }
                                        </div>
                                    </div>
                        )
                    })
                }
            </div>
        )
    }
}