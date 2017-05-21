const task = {

    newTask: (backupId, time, action, details) => {
        let taskId = task.getTaskId();

        return {
            id: taskId,
            backupId,
            time,
            action,
            details
        }
    },

    getTaskId: () => {
        let id = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for(let i = 0; i < 64; ++i) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return id;
    }

};

module.exports = task;