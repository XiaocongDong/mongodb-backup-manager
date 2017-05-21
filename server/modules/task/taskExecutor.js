const actions = require("modules/constants/task");
const controller = require("modules/controller/controller");
const log = require('modules/utility/logger');


const taskExecutor = {

    execute: task => {
        const backupManager = controller.getBackupManager(task.backupId);

        if(!backupManager) {
            log.error(`${ task.backupId } doesn't exist!`)
            return;
        }

        switch (task.action) {
            case actions.BACKUP:
                backupManager.backup();
                break;

            case actions.DELETE_DB:
                const dbName = task.details.dbName;
                backupManager.deleteCopyDB(dbName);
                break;

            default:
                break;
        }
    }

};

module.exports = taskExecutor;