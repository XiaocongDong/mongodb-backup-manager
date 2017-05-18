import React, { Component } from 'react';
import Select from 'react-select';
import { STATUS } from 'constants/backup';

const statusOpts = STATUS.map(status => {
    return {
        value: status,
        label: status
    }
});

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
                                    value={ props.statusFilter }
                                    options={ statusOpts }
                                    onChange={ props.onStatusChange }
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
                                    clearable={ props.clearableId }
                                    value={ props.idFilter }
                                    options={ props.idOpts }
                                    onChange={ props.onIdChange }
                                />
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }
}