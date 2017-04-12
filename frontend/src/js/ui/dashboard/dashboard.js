import React, { Component } from 'react';

import Filters from '../../redux/container/filters';

export default class Dashboard extends Component{

    render() {
        return (
            <div className="dashboard">
                <div className="filters-wrapper">
                    <Filters
                        showStatus={ true }
                        showId={ true }
                    />
                </div>
            </div>
        )
    }
}