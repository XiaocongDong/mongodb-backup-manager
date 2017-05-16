import React, { Component } from 'react';
import RemoteDatabase from './remote/database';
import LocalDatabases from './local/databases';


export default class DatabasesContent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { originalDB, copyDBs } = this.props;
        const id = this.props.id;

        return (
            <div className="backup-content databases-content">
                <RemoteDatabase
                    originalDB={ originalDB }
                    id={ id }
                />
                <LocalDatabases
                    copyDBs={ copyDBs }
                    id={ id }
                />
            </div>
        )
    }
}