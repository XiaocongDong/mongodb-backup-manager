import React, { Component } from 'react';
import databases from '../../../api/databases';


export default class BackupDatabase extends Component {

    constructor(props) {
        super(props);
        this.state ={
            show: false
        }
    }

    handleDelete(id, db) {
        databases.deleteCopyDB(id, db)
    }

    handleToggle() {
        this.setState({ show: !this.state.show})
    }

    render() {
        const database = this.props.database;
        const show = this.state.show;

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
                        <span className="operation button yes clickable" onClick={ this.handleToggle.bind(this) }>
                            details
                        </span>
                        <span className="operation button yes clickable">
                            restore
                        </span>
                        <span className="operation button no clickable" onClick={ this.handleDelete.bind(this, database.id, database.name) }>
                            delete
                        </span>
                    </div>
                </div>
                {
                    (show) &&
                    (
                        <div className="database-details">
                            {
                                database.collections.map((collection, index) => {
                                    return (
                                        <div className="database-collection" key={ index }>
                                            <input type="checkbox"/>
                                            <span className="collection-name">{ collection }</span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
                }
            </div>
        )
    }
}