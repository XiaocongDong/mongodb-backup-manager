const backupCons = require('modules/constants/backup');

class BackupManager {

    constructor(targetDB, localDB, backupConfig) {
        this.backupDB = targetDB;
        this.localDB = localDB;
        this.backupConfig = backupConfig;
        this.activites = new Set();
    }

    start() {
        console.log('Started the backup logic for ' + this.backupConfig.id);

        const now = new Date();

        let firstTimeout = this.backupConfig.startTime? (Date.parse(this.backupConfig.startTime) - now.valueOf()): 0;

        let firstBackup = setTimeout(() => {
            let backUpRoutine = setInterval(this.backUp, this.backupConfig.interval);
            this.activites.add(backUpRoutine);
            this.backUp()
        }, firstTimeout);

        this.activites.add(firstBackup);
    }

    backUp() {
        let now = new Date();
        const nextBackUpTime = new Date(now.valueOf() + this.backupConfig.interval);
        const backUpTargetDBName = this.getTargetBackUpDBName(now);

        return new Promise((resolve, reject) => {
             this.backupDB.connect()
                          .then(() => {
                              this.backupConfig.setBackupStatus(backupCons.status.RUNNING);
                              this.backupConfig.addBackupLog(now, `Start to run backup for ${this.backupConfig.backupDB}`);
                              this.backupConfig.setNextBackupTime(nextBackUpTime);
                              this.localDB.updateBackUpConfig(this.backupConfig)
                                          .then(() => {
                                              this.backupDB
                                                  .readFromCollections(this.backupConfig.backupDB, this.backupConfig.backupCollections)
                                                  .then(collectionsDocs => {
                                                      this.localDB.writeToCollections(backUpTargetDBName, collectionsDocs)
                                                                  .then(() => {
                                                                      /**
                                                                       * update backup config with successful info
                                                                       */
                                                                      let now = new Date();
                                                                      let dbDuration = this.backupConfig.constraints.duration;
                                                                      let deleteTime = dbDuration? new Date(now.valueOf() + dbDuration): '';

                                                                      this.backupConfig.setBackupStatus(backupCons.WAITING);
                                                                      this.backupConfig.addBackupDB(backUpTargetDBName, now, deleteTime);
                                                                      this.backupConfig.addBackupLog(now, `backup ${ this.backupConfig.backupDB } successfully`);

                                                                      this.localDB.updateBackUpConfig(this.backupConfig.backupConfig)
                                                                                  .then(() => {
                                                                                      console.log(`backup ${ this.backupConfig.backupDB } successfully`);
                                                                                      // set timer to delete the database when it expired
                                                                                      setTimeout(this.localDB.deleteDatabase.bind(this.localDB, backUpTargetDBName), deleteTime.valueOf());
                                                                                      resolve()
                                                                                  })
                                                                                  .catch((err) => {
                                                                                      /**
                                                                                       * when the status can' be updated, the backup failed, delete copy database
                                                                                       */
                                                                                      this.localDB.deleteDatabase(backUpTargetDBName)
                                                                                                  .then(() => {
                                                                                                      console.log(`Successfully delete ${ backUpTargetDBName }`);
                                                                                                      reject(new Error(`Update Backup config failed for ${ err.message }, clean copy successfully`));
                                                                                                  })
                                                                                                  .catch(() => {
                                                                                                      console.error(`Failed to delete ${ backUpTargetDBName }`);
                                                                                                      reject(new Error(`Update Backup config failed for ${ err.message }, clean copy failed`));
                                                                                                  })
                                                                                  })
                                                                    })
                                                                  .catch(err => {
                                                                      this.backupConfig.setBackupStatus(backupCons.WAITING);
                                                                      this.backupConfig.addBackupLog(now, `backup ${ this.backupConfig.backupDB } failed`);

                                                                      this.localDB.updateBackUpConfig(this.backupConfig.backupConfig)
                                                                                  .then(() => {
                                                                                      console.log(`backup ${ this.backupConfig.backupDB } failed, successfully update backupConfig`);
                                                                                  })
                                                                                  .catch((err) => {
                                                                                      console.error(`backup ${ this.backupConfig.backupDB } failed, failed to update backup Config for ${ err.message }`)
                                                                                  })
                                                                                  .finally(() => {
                                                                                      /**
                                                                                       * deleted copy anyway
                                                                                       */
                                                                                      this.localDB.deleteDatabase(backUpTargetDBName)
                                                                                          .then(() => {
                                                                                              console.log(`Successfully delete ${ backUpTargetDBName }`);
                                                                                          })
                                                                                          .catch(() => {
                                                                                              console.error(`Failed to delete ${ backUpTargetDBName }`);
                                                                                          })
                                                                                          .finally(() => {
                                                                                              reject(`Failed to backup ${ this.backupConfig.backupDB }`);
                                                                                          })
                                                                                  });
                                                                  });
                                                    })
                                                  .catch((err) => reject(err));
                                          })
                                          .catch(err => {
                                              console.error(`Failed to update status and log of the backupConfig for ${ this.backupConfig.id }`);
                                              reject(err);
                                          });

                          })
                          .catch(err => reject(err))
                          .finally(this.backupDB.close)
        });
    }

    stopAllActivities() {
        this.activites.forEach(activity => clearTimeout(activity))
    }

    getTargetBackUpDBName(date) {
        return `${ this.backupConfig }-${ date.toISOString() }`
    }
}

module.exports = BackupManager;
