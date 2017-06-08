import React, { Component } from 'react';
import object from 'utility/object';
import input from 'utility/input';
import Pagination from 'components/Pagination';
import sift from 'sift';


export default class CollectionViewer extends Component {

    paginationLimits = [1, 10, 20, 50, 100];

    constructor(props) {
        super(props);
        this.data = props.data;
        this.filteredData = this.data;
        this.queryStringError = undefined;
        this.promise = props.promise;
        this.dataLoaded = this.promise? false: true;
        this.inputKeyCode = 13;
        this.state = {
            loaded: this.dataLoaded,
            error: false,
            start: 0,
            limit: this.paginationLimits[1]
        };
        this.keyDownHandler = this.keyDownHandler.bind(this);
    }

    componentDidMount() {
        // specified the data
        if(this.promise) {
            this.promise
                .then(data => {
                    this.data = data;
                    this.filteredData = data;
                    this.setState(
                        {
                            loaded: true,
                            error: false
                        }
                    )
                })
                .catch(err => {
                    console.error(err);
                    this.setState(
                        {
                            loaded: true,
                            error: err.message
                        }
                    )
                })
        }
        document.addEventListener('keydown', this.keyDownHandler);
    }

    componentWillUnmount() {
        document.removeListener('keydown', this.keyDownHandler);
    }

    setPaginationStart(start) {
        this.setState({
            start
        })
    }

    setPaginationLimit(limit) {
        this.setState({
            start: 0,
            limit
        })
    }

    onSearchClick(event) {
        event.preventDefault();

        const queryString = this.input.value;

        if(input.isEmpty(queryString)) {
            this.filteredData = this.data;
            this.queryStringError = null;
        }else {
            try {
                const query = JSON.parse(queryString);
                this.filteredData = sift(query, this.data);
                this.queryStringError = null;
            } catch (e) {
                this.queryStringError = e.message;
            }
        }

        this.input.blur();
        if(this.queryStringError) {
            this.forceUpdate();
        }else {
            this.setState({
                start: 0
            })
        }
    }

    keyDownHandler(event) {
        const keyCode = event.keyCode;
        if(keyCode == this.inputKeyCode) {
            this.onSearchClick(event);
        }
    }

    render() {
        const { loaded, error, start, limit } = this.state;

        let total, showData, prettyData;

        if(this.filteredData) {
            total = this.filteredData.length;
            showData = this.filteredData.slice(start, start + limit);
            prettyData = object.prettifyArr(showData);
        }

        return (
            <div className="data-viewer">
                {
                    !loaded && (
                        <div className="viewer-loading">
                            <div className="loader"></div>
                            <div className="text" data-content="loading">loading...</div>
                        </div>
                    )
                }
                {
                    loaded && error && (
                        <div className="viewer-error">
                            <div>{ error }</div>
                        </div>
                    )
                }
                {
                    loaded && !error && (
                        <div className="data-content">
                            <div className="content-title">{ this.props.title }</div>
                            <div className="content-query">
                                <div className="query-text">Query</div>
                                <div className="query-search-field" data-error={ this.queryStringError }><input type="text" ref={ input => this.input = input }/></div>
                                <div className="button yes query-search-button" onClick={ this.onSearchClick.bind(this)} >search</div>
                            </div>
                            <div className="content-pagination">
                                <Pagination
                                    start={ start }
                                    total={ total }
                                    limit={ limit }
                                    limits={ this.limits }
                                    onLimitChange={ this.setPaginationLimit.bind(this) }
                                    onStartChange={ this.setPaginationStart.bind(this) }
                                />
                            </div>
                            <div className="content-text">
                                <textarea disabled="disabled" value={ prettyData }/>
                            </div>
                        </div>
                    )
                }

            </div>
        )
    }
}