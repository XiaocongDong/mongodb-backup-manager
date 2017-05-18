import React, { Component } from 'react';
import RemoteDB from 'components/RemoteDB';
import LocalDBs from 'components/LocalDBs';


export default class DatabasesContent extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { originalDB, copyDBs } = this.props;
        const id = this.props.id;

        return (
            <div className="backup-content databases-content">
                <RemoteDB
                    originalDB={ originalDB }
                    id={ id }
                />
                <LocalDBs
                    copyDBs={ copyDBs }
                    id={ id }
                />
            </div>
        )
    }
}