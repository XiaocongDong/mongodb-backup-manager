import React, { Component } from 'react';
import Pagination from 'components/Pagination';
import colorPicker from 'utility/colorPicker';
import object from 'utility/object';
import time from 'utility/time';


export default class LogsTable extends Component {

    headers = [
        {
            key: 'time',
            width: 20
        },
        {
            key: 'level',
            width: 10
        },
        {
            key: 'content',
            width: 70
        }
    ];

    limits = [1, 10, 50, 100];

    constructor(props) {
        super(props);
        this.state = {
            limit: this.limits[3],
            start: 0,
            sort: {
                key: 'time',
                order: 'desc'
            }
        }
    }

    setPaginationLimit(limit) {
        this.setState(
            {
                start: 0,
                limit
            }
        )
    }

    setPaginationStart(start) {
        this.setState(
            {
                start
            }
        )
    }

     setSortKey(key) {
        const sort = this.state.sort;

        if(sort.key === key) {
            sort.order = sort.order === 'desc'? 'asc': 'desc';
        }else {
            sort.key = key;
            sort.order = 'asc';
        }

        this.setState(
            {
                sort
            }
        )
    }


    render() {
        const props = this.props;
        const logs = props.logs;

        const { sort, start, limit } = this.state;
        const total = logs.length;
        
        let showedLogs = object.clone(logs.slice(start, start + limit));
        let sortedLogs = object.sortArrByKey(showedLogs, sort.key, sort.order);
        sortedLogs.forEach(log => {
            return time.convertTimeToLocaleString(['time'], log);
        })  

        return (
            <div className="backup-logs-table">
                <div className="tr theader">
                    {
                        this.headers.map((h, index) => {
                            return (
                                <div 
                                    className='td clickable'
                                    key={ index } 
                                    style={ {width: h.width + '%' } }
                                    onClick={ () => this.setSortKey(h.key) }
                                >
                                    { h.key }
                                    {
                                        (h.key === sort.key) && (
                                            sort.order === 'desc'?
                                            <i className="sort-arrow fa fa-caret-down" aria-hidden={ true }></i>:
                                            <i className="sort-arrow fa fa-caret-up" aria-hidden={ true }></i>
                                        )
                                    }
                                </div>
                            )
                        })
                    }
                </div>  
                <div className="tbody">
                    {
                        sortedLogs.map((log, index) => {
                            return (
                                <div 
                                    className='tr' key={ index }
                                    style={ { color: colorPicker.getColorWithLevel(log.level) } }
                                >
                                    {
                                        this.headers.map((h, i) => {
                                            return (
                                                <div 
                                                    className='td' 
                                                    key={ i } 
                                                    style={ {width: h.width + '%'} }
                                                >
                                                    { log[h.key] }
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        })
                    }
                </div>
                <div className="table-pagination">
                    <Pagination
                        start={ start }
                        total={ total }
                        limit={ limit }
                        limits={ this.limits }
                        onLimitChange={ this.setPaginationLimit.bind(this) }
                        onStartChange={ this.setPaginationStart.bind(this) }
                    />
                </div>
            </div>
        )
    }
}