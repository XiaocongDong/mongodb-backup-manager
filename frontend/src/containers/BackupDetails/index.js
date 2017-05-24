import React, { Component } from 'react'

import Title from './subpage/Title';
import Tabs from './subpage/Tabs';
import DBContent from './subpage/DBContent';
import StatsContent from './subpage/StatsContent';
import LogsContent from './subpage/LogsContent';
import ConfigContent from './subpage/ConfigContent';


import { hashHistory } from 'react-router';
import { connect } from 'react-redux';
import object from 'utility/object';

class BackupDetails extends Component {

    tabs = ["databases", "statistics", "notifications", "configurations"];

    setCurrentTab(current) {
        hashHistory.push(this.props.location.pathname + `?tab=${ current }`)
    }

    render() {
        const props = this.props;
        const current = props.location.query.tab || this.tabs[0];

        if(!props.backupConfig) {
            return null;
        }

        let contents = {};
        contents['databases'] = <DBContent
                                    remoteDB={ props.remoteDB }
                                    copyDBs={ props.copyDBs }
                                    backupConfig={ props.backupConfig }
                                />;
        contents['statistics'] = <StatsContent
                                    backupConfig={ props.backupConfig }
                                 />;
        contents['notifications'] = <LogsContent
                                    logs={ props.logs }
                                    id={ props.backupConfig.id }
                            />;

        contents['configurations'] = <ConfigContent 
                                        backupConfig={ props.backupConfig }
                                     />
        return (
            <div className="backup-details">
                <Title backupConfig={ props.backupConfig }/>
                <Tabs
                    tabs={ this.tabs }
                    current={ current }
                    setCurrentTab={ this.setCurrentTab.bind(this) }
                />
                { contents[current] }
            </div>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    const backupConfigs = state.get("data").getIn(["backupConfigs", "data"]);
    const id = ownProps.params.backupId;

    const backupConfig = object.filterArrWithKeyValue("id", id, backupConfigs)[0];
    const allCopyDBs = state.get("data").getIn(["copyDBs", "data"]);
    const copyDBs = object.filterArrWithKeyValue("id", id, allCopyDBs);

    const remoteDBs = state.get("data").getIn(["remoteDBs", "data"]);
    const remoteDB = object.filterArrWithKeyValue("id", id, remoteDBs)[0];
    const allLogs = state.get("data").getIn(["logs", "data"]);
    const logs = object.filterArrWithKeyValue("id", id, allLogs);

    const ids = backupConfigs.map(backupConfig => backupConfig.id);

    return {
        backupConfig,
        copyDBs,
        remoteDB,
        logs,
        ids
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupDetails);
