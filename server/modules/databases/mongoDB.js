const MongoClient = require('mongodb').MongoClient;
const databaseUtil = require('modules/utility/database');
const object = require('modules/utility/object');
const databaseConfig = require('modules/config').config.database;
const log = require('modules/utility/logger');


class MongoDB {

    constructor({server, port, username, password, authDB='admin'}) {
        this.db = null;
        this.dbHash = new Map();
        this.connections = 0;
        this.setConnectionParams({server, port, username, password, authDB});
    }

    setConnectionParams({server, port, username, password, authDB='admin'}) {
        this.server = server;
        this.port = port;
        this.userName = username;
        this.password = password;
        this.authDB = authDB;
        this.url = databaseUtil.getMongoUri(
            username,
            password,
            server,
            port,
            authDB
        );
        return this;
    }

    connect() {
        return Promise.resolve()
            .then(() => {
                this.connections++;

                if(this.db) {
                    return;
                }

                return MongoClient.connect(this.url)
                        .then(db => {
                            log.debug(`connected to ${ this.url }`);
                            this.db = db;
                        })
                        .catch(err => {
                            log.error(`Failed to connect to ${ this.url } for ${err.message}`);
                            throw new Error(err);
                        });
            });
    }

    close() {
        return Promise.resolve()
            .then(() => {
                this.connections--;

                if(this.connections > 0) {
                    log.debug(`Some activities are still running, can't close the mongo connection`);
                    return;
                }

                if (this.db == null) {
                    log.debug(`${ this.url } is not connected`);
                    return;
                }

                return this.db.close()
                    .then(result => {
                        this.db = null;
                        this.dbHash.clear();
                    })
                    .catch(err => {
                        log.error(`Failed to close ${ this.url} for ${ err.message }`);
                        throw err;
                    })
            })
    }

    getUserRole() {
        return Promise.resolve()
            .then(() => {
                return this.db.command({usersInfo: this.userName});
            })
            .catch(err => {
                log.error(`Failed to get ${ this.userName } for ${ err.message }`);
                throw err;
            })
            .then(({users}) => {
                if (users.length == 0) {
                    throw new Error(`no user ${ this.userName } found`)
                }

                return users[0]
            });
    }

    getAvailableDBsWithRoles(rolesFilter) {
        return Promise.resolve()
            .then(() => {
                return this.getUserRole();
            })
            .then(user => {
                return user.roles.filter(({role}) => rolesFilter.includes(role))
                    .map(({db}) => db);
            });
    }

    getAvailableDBsWithAdminDb() {
        return Promise.resolve()
            .then(() => {
                const adminDb = this.db.admin();
                return adminDb.listDatabases()
            })
            .then(({databases}) => {
                return databases.map(({name}) => name)
            })
            .catch(err => {
                log.error(`Failed to get available backup dbs for ${ err.message }`);
                throw err;
            });
    }

    getAvailableDBs() {
        return Promise.resolve()
            .then(() => {
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

                return promise
            });
    }

    getCollectionNamesWithDB(dbName) {
        return Promise.resolve()
            .then(() => this.getDBByName(dbName).listCollections().toArray())
            .then(collections => {
                return  collections.filter(({ name }) => !name.match(/system\.[\w+]+/))
                    .map(({ name }) => name)
            })
            .catch(err => {
                log.error(`Failed to get all ${ dbName } collections for ${ err.message }`);
                throw err;
            });
    }

    getAvailableBackupCollections() {
        return Promise.resolve()
            .then(() => {
                return this.getAvailableDBs()
            })
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
            });
    }

    updateDocsInCollection(dbName, collectionName, update, query, multi= false) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {
                    if(err) {
                        return reject(err);
                    }

                    let operation = null;

                    if(!multi) {
                        operation = collection.updateOne(query, update, { upsert: true, w: 1 });
                    }else {
                        operation = collection.updateMany(query, update, { upsert: false })
                    }

                    operation.then(result => {
                                  resolve();
                              })
                              .catch(err => {
                                  reject(err);
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
        return Promise.resolve()
            .then(() => {
                return Promise.all(collections.map(collection => {
                        return Promise.resolve()
                            .then(() => this.readFromCollection(db, collection, {}) )
                            .then(docs => {
                                log.debug(`Read from ${collection} of ${ db }`);
                                return { collection, docs };
                            })
                            .catch(err => {
                                log.error(`Failed to read from ${collection} of ${ db } for ${ err.message }`);
                                throw err
                            });
                    }).map(p => p.catch(e => e)))
            })
            .then(results => {
                const errors = results.filter(collectionDocs => collectionDocs instanceof Error);

                if(errors.length > 0) {
                    log.error(`Failed to read all the data from ${ collections } of ${ db } for ${errors[0].message}`);
                    throw errors[0];
                }

                log.debug(`Finished read data from the ${ collections } of ${ db }`);
                return results;
            });
    }

    writeToCollections(db, collectionsDocs) {
        return Promise.resolve()
            .then(() => {
                return Promise.all(
                    collectionsDocs.map(collectionDocs => {
                            return Promise.resolve()
                                .then(() => {
                                    const {collection, docs} = collectionDocs;
                                    return this.writeToCollection(db, collection, docs)
                                })
                        }).map(p => p.catch(e => e)))
            })
            .then(results => {
                const errors = results.filter(result => result instanceof Error);
                if(errors.length > 0) {
                    log.error(`Failed to backup all the data to ${ db } for ${errors[0].message}`);
                    throw errors[0];
                }
                log.debug(`wrote all the data to ${ db }`);
            })
    }

    writeToCollection(dbName, collectionName, docs) {
        return new Promise((resolve, reject) => {
            this.getDBByName(dbName).collection(collectionName, {strict: false},
                (err, collection) => {

                    if(err) {
                        log.err(`Failed to write for ${ collectionName } of ${ dbName } for ${ err.message }`);
                        return reject(err);
                    }

                    if(docs.length == 0) {
                        log.debug(`${ collectionName } is empty`);
                        this.getDBByName(dbName).createCollection(collectionName)
                            .then(() => {
                                log.debug(`Created empty ${ collectionName } in ${ dbName }`);
                                resolve();
                            })
                            .catch(err => {
                                log.error(`Failed to create empty ${ collectionName } in ${ dbName } for ${ err.message }`);
                                reject(err);
                            });
                    }

                    else {
                        collection.insertMany(docs)
                            .then(result => {
                                log.debug(`Wrote to ${ collectionName } of ${ dbName }`);
                                resolve();
                            })
                            .catch(err => {
                                log.error(`Failed to write to ${ collectionName } of ${ dbName } for ${ err.message }`);
                                reject(err);
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
                        log.error(`Failed to delete docs for ${ err.message }`);
                        return reject(err);
                    }

                    collection.deleteMany(filter)
                        .then(() => {
                            resolve()
                        })
                        .catch(err => {
                            log.error(`Failed to delete docs with ${ filter } for ${ err.message }`);
                            return reject(err);
                        })
            })
        })
    }

    deleteDatabase(dbName) {
        return Promise.resolve()
            .then(() => {
                return this.getDBByName(dbName).dropDatabase()
            });
    }

    deleteCollections(dbName, collectionNames) {
        return Promise.all(collectionNames.map(collectionName => {
            return this.getDBByName(dbName).dropCollection(collectionName)
                       .catch(err => {
                           // when the collection doesn't exist the delete action will throw a 'ns not found' error,
                           // need to skip this error
                           if(!err.message.includes('ns not found')) {
                               throw err
                           }
                       });
        }))
    }

    getDBByName(dbName) {
        if(!this.dbHash.has(dbName)) {
            this.dbHash.set(dbName, this.db.db(dbName));
        }

        return this.dbHash.get(dbName);
    }
}

module.exports = MongoDB;
