import io from 'socket.io-client';
import dataLoader from './dataLoader';

const clientSocket = {

    startSocket: () => {
        clientSocket.socket = io();
        clientSocket.socket.on('connect', () => {
            if(__DEV__) {
                console.log('socket connected to server successfully');
            }
        });
    },

    startListenBackupConfigsChanges: () => {
        clientSocket.socket.on('backupConfigs', (backupId) => {
            dataLoader.updateBackupConfig(backupId)
        })
    },

    startListenCopyDBsChanges: () => {
        clientSocket.socket.on('copyDBs', (backupId) => {
            dataLoader.updateCopyDBs(backupId)
        })
    },

    startListenLogsChanges: (name) => {
        clientSocket.socket.on(name, () => {
            dataLoader.updateLogs(name);
        })
    },

    stopListenChanges: (event) => {
         clientSocket.socket.off(event);
    }
};

export default clientSocket;