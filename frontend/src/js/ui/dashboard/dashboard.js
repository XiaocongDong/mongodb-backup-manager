import React, { Component } from 'react';

import Filters from '../../redux/container/filters';

export default class Dashboard extends Component{

    render() {
        return (
            <div className="dashboard">
                <Filters
                    showStatus={ true }
                    showId={ true }
                    multiIds={ true }
                />
            </div>
        )
    }
}