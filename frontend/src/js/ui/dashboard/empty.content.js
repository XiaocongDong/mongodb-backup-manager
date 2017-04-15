import React, { Component } from 'react';
import { hashHistory } from 'react-router';


export default class EmptyContent extends Component {

    handleClick() {
        hashHistory.push('/newConfig');
    }

    render() {
        return (
            <div className="empty-content">
                <div className="content-wrapper">
                    <div className="title">
                        No backups found
                    </div>
                    <div className="button yes jump-to-new-config-button" onClick={ this.handleClick.bind(this) }>
                        New Backup
                    </div>
                </div>
            </div>
        )
    }

}