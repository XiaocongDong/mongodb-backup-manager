import React, { Component } from 'react'
import Title from './subpage/Title';
import Tabs from './subpage/Tabs';
import DBContent from './subpage/DBContent';
import { connect } from 'react-redux';
import object from 'utility/object';

class BackupDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            current: 0
        }
    }

    setCurrentTab(current) {
        this.setState(
            {
                current
            }
        )
    }

    render() {
        const props = this.props;
        const current = this.state.current;

        if(!props.backupConfig) {
            return null;
        }

        const contents = [
            <DBContent
                originalDB={ props.originalDB }
                copyDBs={ props.copyDBs }
                id={ props.backupConfig.id }
            />
        ];

        return (
            <div className="backup-details">
                <Title backupConfig={ props.backupConfig }/>
                <Tabs current={ this.state.current } setCurrentTab={ this.setCurrentTab.bind(this) }/>
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
    const allOriginalDBs = state.get("data").getIn(["originalDBs", "data"]);
    const originalDB = object.filterArrWithKeyValue("id", id, allOriginalDBs)[0];

    const ids = backupConfigs.map(backupConfig => backupConfig.id);

    return {
        backupConfig,
        copyDBs,
        originalDB,
        ids
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupDetails);
