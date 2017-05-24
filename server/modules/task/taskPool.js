const object = require("modules/utility/object");
const log = require('modules/utility/logger');
const task = require('modules/task/task');
const constants = require('modules/constants');


class TaskPool {

    constructor() {
        this.taskSet = new Set();
    }

    setController(controller) {
        this.controller = controller;
    }

    start(interval) {
        setInterval(this.scan.bind(this), interval);
    }

    removeTasksWithBackupId(backupId) {
        this.taskSet = new Set(
            [...this.taskSet].filter(task => {
                return task.backupId !== backupId
            })
        )
    }

    addTask(task) {
        this.taskSet.add(task)
    }

    scan() {
        log.debug(`Start scanning the task pool at ${ new Date().toLocaleString() }`);
        log.debug('whole task', this.taskSet);
        const tasks = this.getAvailableTasks();
        log.debug('avaliable task', tasks);
        for(let task of tasks) {
            this.executeTask(task);
        }
    }

    getAvailableTasks() {
        let availableTasks = [];

        this.taskSet.forEach( task => {
            const now = new Date();
            const actionTime = new Date(task.time);

            if(now >= actionTime) {
                availableTasks.push(task);
                this.taskSet.delete(task);
            }
        })

        return availableTasks;
    }

    executeTask(availTask) {
        const backupManager = this.controller.getBackupManager(availTask.backupId);

        if(!backupManager) {
            log.error(`${ availTask.backupId } doesn't exist!`)
            return;
        }

        switch (availTask.action) {
            case constants.task.BACKUP:
                // backup 
                backupManager.backup();

                const interval = availTask.details.interval;
                if(interval) {
                    const nextBackupTime = new Date().valueOf() + interval;
                    
                    const nextBackupTask = task.newTask(availTask.backupId, nextBackupTime, constants.task.BACKUP, {interval});
                    this.addTask(nextBackupTask);
                    
                    const nextBackupTimeStr = new Date(nextBackupTime).toLocaleString();
                    backupManager.updateBackupConfigToDB({nextBackupTime: nextBackupTimeStr});
                }

                break;

            case constants.task.DELETE_DB:
                const dbName = availTask.details.dbName;
                backupManager.deleteCopyDB(dbName);
                break;

            default:
                break;
        }
    }
}
// make sure there is only one task pool in the application
const TASKPOOL_KEY = Symbol.for('taskPool');

if(!global[TASKPOOL_KEY]) {
    global[TASKPOOL_KEY] = object.selfish(new TaskPool);
}

module.exports = global[TASKPOOL_KEY];
