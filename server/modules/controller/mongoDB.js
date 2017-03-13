const MongoClient = require('mongodb').MongoClient;
const databaseUtil = require('modules/utility/database');
const object = require('modules/utility/object');
const config = require('modules/config');


const DATABASE_ROLES = ['readWrite', 'dbOwner'];
const ALL_DATABASE_ROLES = ['readWriteAnyDatabase'];

object.deployPromiseFinally();

class MongoDB {

    constructor(server, port, username, password, auth_db='admin') {
        this.server = server;
        this.port = port;
        this.userName = username;
        this.password = password;
        this.authDB = auth_db;
        this.url = databaseUtil.getMongoUri(
            username,
            password,
            server,
            port,
            auth_db
        );
        this.db = null;
        this.backUpConfigCollection = null;
        this.dbHash = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log('connected to database with ' + this.url);
            if(this.db) {
                return resolve();
            }

            MongoClient.connect(this.url)
                .then(db => {
                    console.log('connected to the database');
                    this.db = db;
                    resolve()
                })
                .catch(err => {
                    reject(err.message)
                });
        });
    }

    close() {
        if (this.db == null) {
            console.error('close failed: database is not connected');
                return;
            }

        this.db.close()
            .then(result => {
                console.log('successfully close the database');
                this.db = null;
                this.dbHash.clear();
            })
            .catch(err => {
                console.error(err.message);
            });
    }

    getUserRole() {
        return new Promise((resolve, reject) => {
            if (this.db == null) {
                return reject('database is not connected')
            }
            this.db.command({usersInfo: this.userName})
                .then(({users}) => {
                    if (users.length == 0) {
                        return reject(new Error(`no user ${this.userName} found`));
                    }

                    resolve(users[0]);
                })
                .catch(err => reject(err))
            }
        )
    }

    getAvailableDBsWithRoles(rolesFilter) {
        return new Promise((resolve, reject) => {
            this.getUserRole()
                .then(user => {
                    // console.log(user);
                    const databases = user.roles.filter(({role}) => rolesFilter.includes(role))
                        .map(({db}) => db);
                    resolve(databases);
                })
                .catch(err => reject(err));
        })
    }

    getAvailableDBsWithAdminDb() {
        return new Promise((resolve, reject) => {
            if (this.db == null) {
                return reject(new Error('database is not connected'));
            }

            const adminDb = this.db.admin();
            try {
                adminDb.listDatabases()
                    .then(({databases}) => {
                        resolve(databases.map(({name}) => name))
                    })
                    .catch(err => reject(err))
            } catch (err) {
                reject(err);
            }
        })
    }

    getAvailableDBs() {
        return new Promise((resolve, reject) => {
            if (this.db == null) {
                return reject(new Error('database is not connected'));
            }

            let promise = null;
            if (!this.userName) {
                promise = this.getAvailableDBsWithAdminDb()
            } else if (this.authDB == 'admin') {
                promise = this.getUserRole()
                    .then(user => {
                        const filterRoles = user.roles.filter(
                            ({role, db}) => (ALL_DATABASE_ROLES.includes(role)));
                        if (filterRoles.length > 0) {
                            return this.getAvailableDBsWithAdminDb();
                        } else {
                            return [];
                        }
                    })
            } else {
                promise = this.getAvailableDBsWithRoles(DATABASE_ROLES)
            }

            promise
                .then(dbs => resolve(dbs))
                .catch(err => reject(err))
        });
    }

    getCollectionNamesWithDB(db) {
        return new Promise((resolve, reject) => {
            db.listCollections().toArray()
                .then(collections => resolve(
                    collections.map(({name}) => name)
                ))
                .catch(err => reject(err));
        })
    }

    getAvailableBackupCollections() {
        return new Promise((resolve, reject) => {
            this.getAvailableDBs()
                .then(dbNames => {
                    return Promise.all(dbNames.map(
                        dbName => {
                            return new Promise((resolve, reject) => {
                                const newDb = this.getDB(dbName);
                                this.getCollectionNamesWithDB(newDb)
                                    .then(collections => resolve({db: dbName, collections}))
                                    .catch(err => reject(err));
                            });
                        }
                    ));
                })
                .then(dbCollections => {
                    return resolve(dbCollections)
                })
                .catch(err => {
                    return reject(err);
                });
        })
    }

    createBackupConfigCollection() {
        return new Promise((resolve, reject) => {
            const configDBName = config.database.backup_config_db || 'backup_config';
            const backUpsConfigCollection = 'backup_configs';
            const configDB = this.getDB(configDBName);

            configDB.createCollection(backUpsConfigCollection)
                .then(collection => {
                    console.log('connected to mongo config collections');
                    this.backUpConfigCollection = collection;
                    resolve()
                })
                .catch(err => {
                    reject(new Error(
                        'created backup config collection failed for ' + err.message)
                    )
                })
        })
    }

    getBackUpConfig(backUpID) {
        return new Promise((resolve, reject) => {
            this.backUpConfigCollection.find({ id: backUpID })
                .toArray((err, backupConfigs) => {
                    if(err) {
                        return reject(err);
                    }
                    resolve(backupConfigs);
                })
        })
    }

    updateBackUpConfig(backUpConfig) {
        console.log(`updating backup config for ${ backUpConfig.id }`);
        return new Promise((resolve, reject) => {
            this.backUpConfigCollection.updateOne({ id: backUpConfig.id }, backUpConfig, { upsert: true, w: 1 })
                .then(result => {
                    console.log(`updated backup config of ${backUpConfig.id} successfully`);
                    resolve();
                })
                .catch(err => {
                    console.log(err);
                    console.error(`can't update backup config for ${backUpConfig.id}`);
                    reject(err);
                });
        })
    }

    readFromCollection(db, collectionName) {
        return new Promise((resolve, reject) => {
            this.getDB(db).collection(collectionName)
                .then(collection => {
                    collection.find({}).toArray((err, docs) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(docs);
                    })
                })
                .catch(err => reject(err));
        })
    }

    readFromCollections(db, collections) {
        return new Promise((resolve, reject) => {
            Promise.all(collections.map(collection => {
                return new Promise((resolve, reject) => {
                    this.readFromCollection(db, collection)
                        .then(docs => {
                            console.log(`Successfully read from ${collection} of ${db}`);
                            resolve({ collection, docs });
                        })
                        .catch(err => {
                            console.error(`Failed to read from ${collection} of ${db} for ${ err.message }`);
                            reject(err);
                        })
                })
            })).then(collectionsDocs => {
                console.log(`Finished read data from the ${ collections } of ${db}`);
                resolve(collectionsDocs);
            }).catch(err => {
                console.error(`Failed to read all the data from ${ collections } of ${db}`);
                reject(err);
            })
        })
    }

    writeToCollections(db, collectionsDocs) {
        return new Promise((resolve, reject) => {
            Promise.all(collectionsDocs.map(collectionDocs => {
                return new Promise((resolve, reject) => {
                    const { collection, docs } = collectionDocs;
                    this.writeToCollection(db, collection, docs)
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
            })).then(() => {
                console.log(`Successfully write to backup data to ${ db }`);
                resolve();
            }).catch(err => {
                console.error(`Failed to backup data to ${ db } for ${err.message}`)
                reject(err)
            })
        })
    }

    writeToCollection(db, collectionName, docs) {
        return new Promise((resolve, reject) => {
            this.getDB(db).collection(collectionName)
                .then(collection => {
                    collection.insertMany(docs)
                        .then(result => {
                            console.log(`successfully write to ${ collectionName } of ${ db }`);
                            resolve();
                        })
                        .catch(err => {
                            console.error(`can't write to ${ collectionName } of ${ db }`);
                            reject(err);
                        })
                })
        })
    }

    deleteDatabase(db) {
        return new Promise((resolve, reject) => {
            this.getDB(db).dropDatabase()
                .then(result => {
                    console.log(`successfully deleted ${ db } database`);
                    resolve()
                })
                .catch(err => {
                    console.error( `failed to deleted ${ db } database`);
                    reject(err);
                })
        })
    }

    getDB(dbName) {
        if(!this.db) {
            console.error(`database is not connected`);
            return;
        }

        if(!this.dbHash.has(dbName)) {
            this.dbHash.set(dbName, this.db.db[dbName])
        }

        return this.dbHash.get(dbName);
    }
}

module.exports = MongoDB;
