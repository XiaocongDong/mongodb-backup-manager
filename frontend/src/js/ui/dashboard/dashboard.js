import React, { Component } from 'react';

import Filters from '../../redux/container/filters';

export default class Dashboard extends Component{

    render() {
        return (
            <div className="dashboard">
                <div className="side-bar">
                    <Filters
                        showStatus={ true }
                        showId={ true }
                        multiIds={ true }
                    />
                </div>
            </div>
        )
    }
}