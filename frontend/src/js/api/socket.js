import io from 'socket.io-client';
import dataLoader from './dataLoader';

const clientSocket = {

    startSocket: () => {
        const socket = io("http://localhost:8000");
        socket.on('connect', () => {
            console.log('socket connected to server successfully');
        });
        socket.on('backupConfigs', () => {
            console.log('backupConfigs changed!');
            dataLoader.loadBackupConfigs();
        })
    }

};

export default clientSocket;