import React, { Component } from 'react';
import OriginalDatabase from './original.database';
import CopyDatabases from './copy.databases';


export default class DatabasesContent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { originalDB, copyDBs } = this.props;


        return (
            <div className="backup-content databases-content">
                <OriginalDatabase
                    originalDB={ originalDB }
                />
                <CopyDatabases
                    copyDBs={ copyDBs }
                />
            </div>
        )
    }
}