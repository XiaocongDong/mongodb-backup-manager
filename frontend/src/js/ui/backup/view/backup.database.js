import React, { Component } from 'react';


export default class BackupDatabase extends Component {

    constructor(props) {
        super(props);
        this.state ={
            show: false
        }
    }

    handleToggle() {
        this.setState({ show: !this.state.show})
    }

    render() {
        const database = this.props.database;

        return (
            <div className="database clickable">
                <div className="database-header">
                    <div className="time-wrapper">
                        <div className="time">
                            <span className="name" style={ { color: "#aaa"} }>created time</span>
                            <span className="value">
                                { database.createdTime }
                            </span>
                        </div>
                        {
                            (database.deletedTime) &&
                            (<div className="time">
                                <span className="name" style={ { color: "#ed281a"} }>deleted time</span>
                                <span className="value">
                                    { database.deletedTime }
                                </span>
                            </div>)
                        }
                    </div>
                    <div className="collection-number-wrapper">
                        <span className="name">collections</span>
                        <span className="number">{ database.collections.length }</span>
                    </div>
                    <div className="operations-wrapper">
                        <span className="operation button yes clickable" onClick={ this.handleDelete.bind(this) }>
                            restore
                        </span>
                        <span className="operation button no clickable">
                            delete
                        </span>
                    </div>
                </div>
            </div>
        )
    }
}