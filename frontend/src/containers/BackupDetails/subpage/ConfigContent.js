import React, { Component } from 'react';
import BackupConfig from 'components/BackupConfig'
import backupConfigUtil from 'utility/backupConfig';
import databases from 'api/databases';
import { hashHistory } from 'react-router';
import modalController from 'utility/modal';


export default class ConfigContent extends Component {

	constructor(props) {
		super(props);
		this.state = {
			update: false,
			review: true,
			disabled: false
		}
		this.dbsColls=null;
	}

	handleEditConfig() {
		if(this.state.disabled) {
			return;
		}

		this.setState(
			{
				diabled: true
			},
			() => {
				const backupConfig =  backupConfigUtil.
										 prepareReviewBackupConfig(this.props.backupConfig);

				databases.getAvailableDBs(backupConfig)
						.then( ( { data } ) => {
							this.dbsColls = data;
							this.setState({
								update: true,
								review: false,
							})
						})
						.catch( (error)  => {
						    const err = response.data.message;

							modalController.showModal({
								type: 'error',
								title: `failed to update ${ backupConfig.id }`,
								text: err,
								buttons: [
									{
										text: 'ok',
										onClick: modalController.closeModal
									}
								]
                            })
						});
		})
	}

	handleCancel() {
		this.setState({
			update: false,
			review: true,
			disabled: false
		})
	}

	render() {
		const { backupConfig } = this.props;
		const { disabled, update, review } = this.state;

 		const reviewBackupConfig = backupConfigUtil.prepareReviewBackupConfig(backupConfig);

		return (
			<div className="config-content">
				<BackupConfig
					review={ review }
					update={ update }
					backupConfig={ reviewBackupConfig }
					dbsColls={ this.dbsColls }
					id={ backupConfig.id }
				/>
				{ 
					review &&
					(
						<div className='button-wrapper'>
							<div className={ 'edit-button button yes' + (disabled?' button-waiting': '')} onClick={ this.handleEditConfig.bind(this) }>Edit Config</div>
						</div>
					)
				}
				{
					update && 
					(
						<div className='cancel-wrapper'>
							<div className='cancel clickable' onClick = { this.handleCancel.bind(this)} title='cancel edit'>
								<i className='fa fa-times'></i>
							</div>
						</div>
					)
				}
			</div>
		)
	}
}