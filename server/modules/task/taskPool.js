const taskExecutor = require("modules/taskExecutor");


class TaskPool {

    constructor() {
        super();
        this.taskSet = new Set();
    }

    start(interval) {
        setTimeout(this.scan, interval);
    }

    removeTasksWithBackupId(backupId) {
        this.taskSet = this.taskSet.filter(task => {
            return task.backupId !== backupId
        })
    }

    addTask(task) {
        this.taskSet.add(task)
    }

    scan() {
        const tasks = this.getAvailableTasks();

        for(let task of tasks) {
            taskExecutor.execute(task);
        }
    }

    getAvailableTasks() {
        let availableTasks = [];

        for(let task of this.taskSet.values()) {
            const now = new Date();

            if(now >= task.time) {
                availableTasks.push(task);
            }
        }

        // delete available tasks from set
        for(let availableTask in availableTasks) {
            this.taskSet.remove(availableTask);
        }

        return availableTasks;
    }
}