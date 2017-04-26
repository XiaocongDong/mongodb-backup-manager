import React, { Component } from 'react';
const sift = require('sift');


export default class CollectionViewer extends Component {

    constructor(props) {
        super(props);
        this.data = props.data;
        this.promise = props.promise;
        this.dataLoaded = this.promise? false: true;
        this.state = {
            loaded: this.dataLoaded,
            error: false
        }
    }

    componentDidMount() {
        // specified the data
        if(this.promise) {
            this.promise
                .then(data => {
                    this.data = data;
                    this.setState(
                        {
                            loaded: true,
                            error: false
                        }
                    )
                })
                .catch(err => {
                    this.setState(
                        {
                            loaded: true,
                            error: err.message
                        }
                    )
                })
        }
    }

    render() {
        if(!this.state.loaded) {
            return (
                <div className="data-viewer">
                    <div className="viewer-loading">
                        <div className="loader"></div>
                        <div className="text">loading...</div>
                    </div>
                </div>
            )
        }

        if(!this.state.loaded && this.state.error) {
            return (
                <div className="data-viewer">
                    <div className="viewer-error">
                        <div>{ this.state.error }</div>
                    </div>
                </div>
            )
        }

        const prettyData = JSON.stringify(this.data, undefined, 4);

        return (
            <div className="data-viewer">
                <div className="viewer-query">
                    <span>Query</span>
                    <input type="text"/>
                </div>
                <div className="viewer-pagination">

                </div>
                <div className="viewer-content">
                    <textarea>
                        { prettyData }
                    </textarea>
                </div>
            </div>
        )
    }
}