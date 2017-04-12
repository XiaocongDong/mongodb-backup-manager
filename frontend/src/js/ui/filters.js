import React, { Component } from 'react';
import Select from 'react-select';

const statusOpts = [
    { value: 'STOP', label: 'STOP'},
    { value: 'WAITING', label: 'WAITING'}
];

const idOpts = [
    { value: 'copy@localhost', label: 'copy@localhost' },
    { value: 'crcdashboard@localhost', label: 'crcdashboard@localhost' }
];

export default class Filters extends Component {

    render() {
        const props = this.props;

        return (
            <div className="filters">
                {
                    (props.showStatus) &&
                    (
                        <div className="item">
                            <div className="name">status</div>
                            <div className="filter status-filter">
                                <Select
                                    name="status-filter"
                                    multi={ true }
                                    placeholder="please select backup status"
                                    value={ props.status }
                                    options={ statusOpts }
                                    onChange={ props.setStatus }
                                />
                            </div>
                        </div>
                    )
                }
                {
                    (props.showId) &&
                    (
                        <div className="item">
                            <div className="name">backup id</div>
                            <div className="filter id-filter">
                                <Select
                                    name="id-filter"
                                    multi={ props.multiIds }
                                    placeholder="please select backup id"
                                    value={ props.id }
                                    options={ idOpts }
                                    onChange={ props.setId }
                                />
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}