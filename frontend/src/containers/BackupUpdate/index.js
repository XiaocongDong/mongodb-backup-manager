import React, { Component } from 'react';
import BackupConfig from 'components/BackupConfig';
import { connect } from 'react-redux';
import object from 'utility/object';


class BackupUpdate extends Component {

	render() {
		const backupConfig = this.props.backupConfig;

		return (
			<BackupConfig
				backupConfig={ backupConfig }
				update={ true }
			/>
		)
	}
}

const mapStateToProps = (state, ownProps) => {
    const backupConfigs = state.get("data").getIn(["backupConfigs", "data"]);
    const id = ownProps.params.backupId;

    const backupConfig = object.filterArrWithKeyValue("id", id, backupConfigs)[0];

    return {
        backupConfig
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

export default connect(mapStateToProps, mapDispatchToProps)(BackupUpdate);