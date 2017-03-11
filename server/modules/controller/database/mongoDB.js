const MongoClient = require('mongodb').MongoClient;
const databaseUtil = require('modules/utility/database');
const object = require('modules/utility/object');
const DATABASE_ROLES = ['readWrite', 'dbOwner'];
const ALL_DATABASE_ROLES = ['readWriteAnyDatabase'];

object.deployPromiseFinally();

class MongoDB {

    constructor(server, port, username, password, authDB) {
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
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            console.log('connected to database with ' + this.url);
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
                                const newDb = this.db.db(dbName);
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
}

module.exports = MongoDB;

