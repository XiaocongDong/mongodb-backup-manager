import React, { Component } from 'react';
import BackupConfig from 'components/BackupConfig'
import backupConfigUtil from 'utility/backupConfig';

import { hashHistory } from 'react-router';


export default class ConfigContent extends Component {

	render() {
		const { backupConfig } = this.props;
		const reviewBackupConfig = backupConfigUtil.prepareReviewBackupConfig(backupConfig);
		console.log(reviewBackupConfig);
		return (
			<div className="config-content">
				<BackupConfig
					review={ true }
					backupConfig={ reviewBackupConfig }
				/>
			</div>
		)
	}
}