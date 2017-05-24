import React, { Component } from 'react';
import RemoteDB from 'components/RemoteDB';
import LocalDBs from 'components/LocalDBs';
import dataLoader from 'api/dataLoader';


export default class DatabasesContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            remoteUpdating: false
        };
        this.updateRemoteDB = this.updateRemoteDB.bind(this);
    }

    updateRemoteDB(id) {
        this.setState({
            remoteUpdating: true
        });

        dataLoader.updateRemoteDB(id)
            .then(() => {
                this.setState({
                    remoteUpdating: false
                })
            })
            .catch(err => {
                this.setState({remoteUpdating: false});
                console.error(`Failed to update original db for ${ id } for ${ err.message }`);
            });
    }

    componentDidMount() {
        this.updateRemoteDB(this.props.backupConfig.id);
    }

    render() {
        const { remoteDB, copyDBs, backupConfig } = this.props;
        const { remoteUpdating } = this.state;

        return (
            <div className="backup-content databases-content">
                <RemoteDB
                    remoteDB={ remoteDB }
                    backupConfig={ backupConfig }
                    updating = { remoteUpdating }
                    updateRemoteDB = { this.updateRemoteDB }
                />
                <LocalDBs
                    copyDBs={ copyDBs }
                    backupConfig={ backupConfig }
                    updateRemoteDB = { this.updateRemoteDB }
                />
            </div>
        )
    }
}