const MongoClient = require('mongodb').MongoClient;
const databaseUtil = require('modules/utility/database');
const object = require('modules/utility/object');
const databaseConfig = require('modules/config').database;
const log = require('modules/utility/logger');


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
        this.dbHash = new Map();
    }

    connect() {
        return new Promise((resolve, reject) => {
            if(this.db) {
                return resolve();
            }

            MongoClient.connect(this.url)
                .then(db => {
                    log.info(`connected to ${ this.url }`);
                    this.db = db;
                    resolve()
                })
                .catch(err => {
                    const errMessage = `Failed to connect to ${ this.url } for ${err.message}`;
                    log.error(errMessage);
                    reject(new Error(errMessage));
                });
        });
    }

    close() {
        return Promise.resolve()
            .then(() => {
                if (this.db == null) {
                    log.error('close failed: database is not connected');
                    throw Error(`close failed: ${ this.url } is not connected`);
                }

                return this.db.close()
                    .then(result => {
                        this.db = null;
                        log.info(`Clean DB map`);
                        this.dbHash.clear();
                    })
                    .catch(err => {
                        throw new Error(`Failed to connect to ${ this.url } for ${ err.message }`);
                    });
            })
    }

    getUserRole() {
        return new Promise((resolve, reject) => {
            this.db.command({usersInfo: this.userName})
                .then(({users}) => {
                    if (users.length == 0) {
                        return reject(new Error(`no user ${this.userName} found`));
                    }

                    resolve(users[0]);
                })
                .catch(err => {
                    const errorMessage = `Failed to get ${ this.userName } for ${ err.message }`;
                    log.error(errorMessage);
                    reject(new Error(errorMessage));
                })
            }
        )
    }

    getAvailableDBsWithRoles(rolesFilter) {
        return new Promise((resolve, reject) => {
            this.getUserRole()
                .then(user => {
                    const databases = user.roles.filter(({role}) => rolesFilter.includes(role))
                        .map(({db}) => db);
                    resolve(databases);
                })
                .catch(err => reject(err));
        })
    }

    getAvailableDBsWithAdminDb() {
        return new Promise((resolve, reject) => {
            const adminDb = this.db.admin();
            try {
                adminDb.listDatabases()
                    .then(({databases}) => {
                        resolve(databases.map(({name}) => name))
                    })
                    .catch(err => reject(err))
            } catch (err) {
                const errorMessage = `Failed to get available backup dbs for ${err.message}`;
                reject(new Error(errorMessage));
            }
        })
    }

    getAvailableDBs() {
        return new Promise((resolve, reject) => {
            let promise = null;
            if (!this.userName) {
                promise = this.getAvailableDBsWithAdminDb()
            } else if (this.authDB == 'admin') {
                promise = this.getUserRole()
                    .then(user => {
                        const filterRoles = user.roles.filter(
                            ({role, db}) => (databaseConfig.all_database_backup_roles.includes(role)));
                        if (filterRoles.length > 0) {
                            return this.getAvailableDBsWithAdminDb();
                        } else {
                            return [];
                        }
                    })
            } else {
                promise = this.getAvailableDBsWithRoles(databaseConfig.database_backup_roles)
            }

            promise
                .then(dbs => resolve(dbs))
                .catch(err => reject(err))
        });
    }

    getCollectionNamesWithDB(dbName) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).listCollections().toArray()
                .then(collections => resolve(
                    collections.filter(({ name }) => !name.match(/system\.[\w+]+/))
                        .map(({ name }) => name)
                ))
                .catch(err => {
                    const errorMessage = `Failed to get all available backup information for ${ err.message }`;
                    log.error(errorMessage);
                    reject(new Error(errorMessage));
                })
        })
    }

    getAvailableBackupCollections() {
        return new Promise((resolve, reject) => {
            this.getAvailableDBs()
                .then(dbNames => {
                    return Promise.all(dbNames.map(
                        dbName => {
                            return new Promise((resolve, reject) => {
                                this.getCollectionNamesWithDB(dbName)
                                    .then(collections => resolve({db: dbName, collections}))
                                    .catch(err => reject(err))
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

    updateDocInCollection(dbName, collectionName, doc) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {
                    if(err) {
                        const errorMessage = `Failed to update ${ doc.id } in ${ collectionName }`;
                        log.error(errorMessage);
                        reject(new errorMessage);
                        return;
                    }

                    collection.updateOne({ id: doc.id }, doc, { upsert: true, w: 1 })
                        .then(result => {
                            log.info(`Updated ${doc.id} in ${ collectionName }`);
                            resolve();
                        })
                        .catch(err => {
                            const errorMessage = `Failed to update ${ doc.id } of ${ collectionName } for ${ err.message }`;
                            log.error(errorMessage);
                            reject(new Error(errorMessage));
                        })
            } )
        })
    }

    readFromCollection(dbName, collectionName, filter) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {
                    if(err) {
                        return reject(err);
                    }
                    collection.find(filter).toArray((err, docs) => {
                        if(err) {
                            return reject(err);
                        }
                        resolve(docs);
                    })
            })
        })
    }

    readFromCollections(db, collections) {
        return new Promise((resolve, reject) => {
            Promise.all(collections.map(collection => {
                return new Promise((resolve, reject) => {
                    this.readFromCollection(db, collection, {})
                        .then(docs => {
                            log.info(`Read from ${collection} of ${ db }`);
                            resolve({ collection, docs });
                        })
                        .catch(err => {
                            log.error(`Failed to read from ${collection} of ${ db } for ${ err.message }`);
                            reject(err);
                        })
                })
            }).map(p => p.catch(e => e))
            ).then(collectionsDocs => {
                const errors = collectionsDocs.filter(collectionDocs => !collectionDocs.collection);
                if(errors.length > 0) {
                    log.error(`Failed to read all the data from ${ collections } of ${ db } for ${errors[0].message}`)
                    return reject(errors[0])
                }
                log.info(`Finished read data from the ${ collections } of ${ db }`);
                resolve(collectionsDocs);
            }).catch(err => {
                log.error(err);
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
                })}).map(p => p.catch(e => e))
            ).then((results) => {
                const errors = results.filter(result => result);
                if(errors.length > 0) {
                    log.error(`Failed to backup all the data to ${ db } for ${errors[0].message}`);
                    return reject(errors[0])
                }
                log.info(`wrote all the data to ${ db }`);
                resolve();
            })
                .catch(err => {
                    log.error(`Failed to backup all the data to ${ db } for ${err.message}`);
                    reject(err)
                })
        })
    }

    writeToCollection(dbName, collectionName, docs) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {

                    if(err) {
                        const errorMessage = `Failed to write to ${ collectionName } for ${ err.message }`;
                        log.error(errorMessage);
                        return reject(new Error(errorMessage));
                    }

                    if(docs.length == 0) {
                        log.info(`${ collectionName } is empty`);
                        this.getDBByName(dbName).createCollection(collectionName)
                            .then(() => {
                                log.info(`Created empty ${ collectionName } in ${ dbName }`);
                                resolve();
                            })
                            .catch(err => {
                                const errorMessage = `Failed to create empty ${ collectionName } in ${ dbName } for ${ err.message }`;
                                log.error(errorMessage);
                                reject(new Error(errorMessage));
                            });
                    }

                    else {
                        collection.insertMany(docs)
                            .then(result => {
                                log.info(`Wrote to ${ collectionName } of ${ dbName }`);
                                resolve();
                            })
                            .catch(err => {
                                const errorMessage = `Failed to write to ${ collectionName } of ${ dbName } for ${ err.message }`;
                                log.error(errorMessage);
                                reject(new Error(errorMessage));
                            })
                    }
            })
        })
    }

    deleteDocs(dbName, collectionName, filter) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {
                    if(err) {
                        const errorMessage = `Failed to delete docs for ${ err.message }`;
                        log.error(errorMessage);
                        return reject(new Error(errorMessage));
                    }

                    collection.deleteMany(filter)
                        .then(() => {
                            log.info(`Deleted docs with ${ filter } in ${ collectionName } for ${ dbName }`);
                            resolve()
                        })
                        .catch(err => {
                            const errorMessage = `Failed to delete docs with ${ filter } for ${ err.message }`;
                            log.error(errorMessage);
                            return reject(new Error(errorMessage));
                        })
            })
        })
    }

    deleteDatabase(dbName) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).dropDatabase()
                .then(result => {
                    resolve()
                })
                .catch(err => {
                    const errorMessage = `Failed to delete ${ dbName } for ${ err.message }`;
                    log.error(errorMessage);
                    reject(new Error(errorMessage));
                })
        })
    }

    getDBByName(dbName) {
        if(!this.dbHash.has(dbName)) {
            this.dbHash.set(dbName, this.db.db(dbName));
        }

        return this.dbHash.get(dbName);
    }

    closeDBByName(dbName) {
        return Promise.resolve()
                      .then(()=> {
                          if(!this.dbHash.has(dbName)) {
                              throw Error(`Can't close the non-connected ${ dbName }`);
                          }

                          return this.dbHash.get(dbName).close();
                      })
    }
}

module.exports = MongoDB;
