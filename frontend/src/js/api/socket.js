import io from 'socket.io-client';
import dataLoader from './dataLoader';

const clientSocket = {

    startSocket: () => {
        clientSocket.socket = io("http://localhost:8000");
        clientSocket.socket.on('connect', () => {
            console.log('socket connected to server successfully');
        });
    },

    startListenBackupConfigsChanges: () => {
        clientSocket.socket.on('backupConfigs', (backupId) => {
            console.log('backupConfigs changed!');
            dataLoader.updateBackupConfig(backupId)
        })
    },

    startListenCopyDBsChanges: () => {
        clientSocket.socket.on('copyDBs', (backupId) => {
            console.log(`copy database of ${ backupId } changed!`);
            dataLoader.updateCopyDBs(backupId)
        })
    },

    stopListenChanges: (event) => {
         clientSocket.socket.off(event);
    }
};

export default clientSocket;