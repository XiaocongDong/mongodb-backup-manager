module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 19);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var fs = __webpack_require__(41);
var path = __webpack_require__(8);
var stripJsonComments = __webpack_require__(43);

var defaultConfig = {
    auth: {
        username: "admin",
        password: "admin",
        token_exp_time: 3600000
    },
    database: {
        server: "localhost",
        port: 27017,
        backup_config_db: "backup",
        database_backup_roles: ["readWrite", "dbOwner"],
        all_database_backup_roles: ["readWriteAnyDatabase"]
    },
    server: {
        port: 8082,
        interval: 2000,
        logLevel: "info"
    }
};

var config = {

    requirements: {
        auth: {
            mandatory: [{
                key: "username",
                type: String
            }, {
                key: "password",
                type: String
            }, {
                key: "token_exp_time",
                type: Number
            }],
            optional: []
        },
        database: {
            mandatory: [{
                key: "server",
                type: String
            }, {
                key: "port",
                type: Number
            }, {
                key: "backup_config_db",
                type: String
            }, {
                key: "database_backup_roles",
                type: Array
            }, {
                key: "all_database_backup_roles",
                type: Array
            }],
            optional: [{
                key: "username",
                type: String
            }, {
                key: "password",
                type: String
            }, {
                key: "authDB",
                type: String
            }]
        },
        server: {
            mandatory: [{
                key: "port",
                type: Number
            }, {
                key: "interval",
                type: Number
            }, {
                key: "logLevel",
                type: String
            }]
        }
    },

    cmds: {
        auth: [],
        database: [{
            cmd: "dbServer",
            key: "server"
        }, {
            cmd: "dbPort",
            key: "port"
        }, {
            cmd: "username",
            key: "username"
        }, {
            cmd: "password",
            key: "password"
        }, {
            cmd: "authDB",
            key: "authDB"
        }],
        server: [{
            cmd: "serverPort",
            key: "port"
        }, {
            cmd: "interval",
            key: "interval"
        }, {
            cmd: "log",
            key: "logLevel"
        }]
    },

    config: {},

    setConfig: function setConfig(managerConfig) {
        var configFile = managerConfig.config;

        if (configFile != null) {
            // read the config from customized config file
            if (!fs.existsSync(configFile)) {
                throw new Error('Import Error: ' + configFile + ' doesn\'t exist in the system');
            } else {
                config.config = config.readConfig(configFile);
            }
        } else {
            // read config from cmd
            for (var sec in config.cmds) {
                var cmds = config.cmds[sec];

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = cmds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var cmd = _step.value;

                        if (managerConfig.hasOwnProperty(cmd.cmd)) {
                            defaultConfig[sec][cmd.key] = managerConfig[cmd.cmd];
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }

            config.config = defaultConfig;
        }
        // validate the config with requirements
        for (var _sec in config.requirements) {
            if (!config.config.hasOwnProperty(_sec)) {
                throw new Error('Configuration Error: no ' + _sec + ' is sepcified');
            }

            var requirement = config.requirements[_sec];

            var mandatory = requirement.mandatory;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {

                for (var _iterator2 = mandatory[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var mKey = _step2.value;

                    if (!config.config[_sec].hasOwnProperty(mKey.key)) {
                        throw new Error('Configuration Error: ' + _sec + ' error: no ' + mKey.key + ' is specified');
                    }

                    var value = config.config[_sec][mKey.key];

                    if (value.constructor !== mKey.type) {
                        throw new Error('Configuration Error: ' + _sec + ' error: ' + mKey.key + ' must be a ' + mKey.type.name);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }
    },

    readConfig: function readConfig(configFile) {
        var conf = fs.readFileSync(configFile, "utf-8");
        return JSON.parse(stripJsonComments(conf));
    }
};

module.exports = config;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var response = {
    error: function error() {
        var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Error occurred.';
        var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 400;

        if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object') {
            return {
                body: body,
                code: code
            };
        } else {
            return {
                body: {
                    message: body
                },
                code: code
            };
        }
    },
    success: function success() {
        var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var code = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 200;

        if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object') {
            return {
                body: body,
                code: code
            };
        } else if (!body) {
            return { code: code };
        } else {
            return {
                body: {
                    message: body
                },
                code: code
            };
        }
    },
    send: function send(res, data) {
        res.status(data.code).send(data.body);
    }
};

module.exports = response;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Logger = __webpack_require__(38);
var config = __webpack_require__(1).config;

// configure level one time, it will be set to every instance of the logger
Logger.setLevel(config.server.logLevel); // only warnings and errors will be shown

var customConfig = {
    showTimestamp: true
};

var log = new Logger(customConfig);

module.exports = log;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BackupManager = __webpack_require__(20);
var object = __webpack_require__(5);
var constants = __webpack_require__(6);
var response = __webpack_require__(2);
var backupUtil = __webpack_require__(14);
var MongoDB = __webpack_require__(9);
var log = __webpack_require__(3);

var Controller = function () {
    function Controller() {
        _classCallCheck(this, Controller);

        this.localDB = null;
        this.serverSocket = null;
        this.backUpsHash = new Map();
    }

    _createClass(Controller, [{
        key: 'setLocalDB',
        value: function setLocalDB(localDB) {
            this.localDB = localDB;
        }
    }, {
        key: 'setServerSocket',
        value: function setServerSocket(serverSocket) {
            this.serverSocket = serverSocket;
        }
    }, {
        key: 'getBackupManager',
        value: function getBackupManager(backupId) {
            return this.backUpsHash.get(backupId);
        }
    }, {
        key: 'newBackup',
        value: function newBackup(backupConfig, next) {
            var _this = this;

            backupConfig.id = backupUtil.getBackupID(backupConfig);

            if (this.backUpsHash.has(backupConfig.id)) {
                return next(response.error('Created backup failed: ' + backupConfig.id + ' has existed', 409));
            }

            var backupDB = object.selfish(new MongoDB(backupConfig));
            var server = backupConfig.server,
                username = backupConfig.username,
                authDB = backupConfig.authDB,
                db = backupConfig.db,
                collections = backupConfig.collections;


            backupDB.connect().catch(function (err) {
                next(response.error('Failed to connected to ' + backupConfig.server));
                throw err;
            }).then(function () {
                return backupDB.getAvailableBackupCollections();
            }).then(function (dbsCollections) {
                var dbCollections = dbsCollections.filter(function (dbCollection) {
                    return dbCollection.db == db;
                });

                if (dbCollections.length === 0) {
                    throw new Error(db + ' doesn\'t exist in ' + server + ' or ' + username + '@' + authDB + ' can\'t backup it');
                }

                dbCollections = dbCollections[0];

                if (collections) {
                    var invalidCollections = collections.filter(function (collection) {
                        return !dbCollections.collections.includes(collection);
                    });

                    if (invalidCollections.length > 0) {
                        throw new Error('backup collections ' + invalidCollections + ' don\'t exist');
                    }
                }

                backupUtil.updateBackupData(backupConfig);
                return _this.localDB.updateBackupConfig(backupConfig);
            }).then(function () {
                log.info('Created backup config for ' + backupConfig.id);
                var backupManager = object.selfish(new BackupManager(_this.localDB, backupConfig, _this.serverSocket));

                backupManager.start();
                _this.backUpsHash.set(backupConfig.id, backupManager);
                _this.getBackupStatus(backupConfig.id, next);
            }).catch(function (err) {
                next(response.error(err.message));
            }).finally(function () {
                backupDB.close();
            });
        }
    }, {
        key: 'runBackup',
        value: function runBackup(backupID, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('Can\'t not update a nonexistent backup'));
            }

            var backupManager = this.backUpsHash.get(backupID);

            //TODO check backup status here, RUNNING backup can not be run!!!

            backupManager.backup().then(function () {
                var nextBackupTime = backupManager.nextBackupTime;
                var result = {
                    status: constants.backup.result.SUCCEED
                };
                nextBackupTime && (result.nextBackupTime = nextBackupTime);
                next(response.success(result));
            }).catch(function (err) {
                var nextBackupTime = backupManager.nextBackupTime;
                var result = {
                    status: constants.backup.result.FAILED,
                    reason: err.message
                };
                nextBackupTime && (result.nextBackupTime = nextBackupTime);
                next(response.error(result));
            });
        }
    }, {
        key: 'restore',
        value: function restore(backupID, dbName, collections, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('Can\'t not restore for nonexistent backup id ' + backupID));
            }

            var backupManager = this.backUpsHash.get(backupID);

            backupManager.restore(dbName, collections).then(function () {
                next(response.success('Successfully restore ' + backupID + ' from ' + dbName));
            }).catch(function (err) {
                console.error(err);
                next(response.error('Failed to restore ' + backupID + ' from ' + dbName + ' for ' + err.message));
            });
        }
    }, {
        key: 'updateBackupConfig',
        value: function updateBackupConfig(backupID, updates, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('Can\'t not update a nonexistent backup', 404));
            }

            var backupManager = this.backUpsHash.get(backupID);

            backupManager.updateBackupConfig(updates).then(function () {
                next(response.success('Updated backup config for ' + backupID));
            }).catch(function (err) {
                next(response.error('Failed to update backup config for ' + err.message));
            });
        }
    }, {
        key: 'stop',
        value: function stop(backupID, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error(backupID + ' doesn\'t exist', 404));
            }

            var backupManager = this.backUpsHash.get(backupID);
            backupManager.stop().then(function () {
                next(response.success('Stopped ' + backupID));
            }).catch(function (err) {
                next(response.error('Failed to stop ' + backupID + ' for ' + err.message));
            });
        }
    }, {
        key: 'resume',
        value: function resume(backupID, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error(backupID + ' doesn\'t exist', 404));
            }

            var backupManager = this.backUpsHash.get(backupID);
            if (backupManager.backupStatus != constants.backup.status.STOP) {
                return next(response.error('Failed to resume backup for ' + backupID + ' for current status is ' + backupManager.backupStatus));
            }

            backupManager.resume().then(function () {
                next(response.success('Resumed backup for ' + backupID + ' successfully'));
            }).catch(function (err) {
                next(response.error('Failed to resume backup for ' + err.message));
            });
        }
    }, {
        key: 'getBackupStatus',
        value: function getBackupStatus(backupID, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error(backupID + ' doesn\'t exist', 404));
            }

            var backupManager = this.backUpsHash.get(backupID);
            var status = backupManager.backupStatus;
            var nextBackupTime = backupManager.nextBackupTime;
            var result = { status: status, id: backupID };

            if (status == constants.backup.status.WAITING && nextBackupTime) {
                result.nextBackupTime = nextBackupTime.toLocaleString();
            }

            return next(response.success(result));
        }
    }, {
        key: 'deleteBackup',
        value: function deleteBackup(backupID, next) {
            var _this2 = this;

            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist', 404));
            }

            var backupManager = this.backUpsHash.get(backupID);
            if (backupManager.backupStatus == constants.backup.status.RUNNING) {
                return next(response.error('Failed to delete running backup'));
            }

            backupManager.clear().then(function () {
                _this2.backUpsHash.delete(backupID);
                next(response.success('Successfully deleted ' + backupID));
            }).catch(function (err) {
                next(response.error(err, message));
            });
        }
    }, {
        key: 'deleteDB',
        value: function deleteDB(backupID, dbName, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist', 404));
            }

            this.backUpsHash.get(backupID).deleteCopyDB(dbName).then(function () {
                return next(response.success('Successfully deleted ' + dbName));
            }).catch(function (err) {
                return next(response.error(error.message));
            });
        }
    }, {
        key: 'deleteCollections',
        value: function deleteCollections(backupID, dbName, collections, next) {

            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist'));
            }

            this.backUpsHash.get(backupID).deleteCollections(dbName, collections).then(function () {
                next(response.success('Deleted ' + collections + ' of ' + dbName + ' in ' + backupID));
            }).catch(function (err) {
                next(response.error('Failed to deleted ' + collections + ' in ' + dbName + ' for ' + err.message));
            });
        }
    }, {
        key: 'getAvailableDBsCollections',
        value: function getAvailableDBsCollections(mongoParams, next) {
            var server = mongoParams.server,
                port = mongoParams.port,
                username = mongoParams.username,
                password = mongoParams.password,
                authDB = mongoParams.authDB;

            var mongoDB = object.selfish(new MongoDB({ server: server, port: port, username: username, password: password, authDB: authDB }));

            mongoDB.connect().catch(function (err) {
                next(response.error(err.message, 401));
                throw err;
            }).then(mongoDB.getAvailableBackupCollections).then(function (dbCollections) {
                mongoDB.close();
                next(response.success(dbCollections));
            }).catch(function (err) {
                mongoDB.close();
                next(response.error(err.message, 400));
                throw err;
            });
        }
    }, {
        key: 'getCollections',
        value: function getCollections(backupID, dbName, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist', 404));
            }

            this.backUpsHash.get(backupID).getCollections(dbName).then(function (collections) {
                next(response.success(collections));
            }).catch(function (err) {
                next(response.error('' + err.message));
            });
        }
    }, {
        key: 'getDataFromCollection',
        value: function getDataFromCollection(backupID, dbName, collectionName, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist', 404));
            }

            this.backUpsHash.get(backupID).getDataFromCollection(dbName, collectionName, {}).then(function (docs) {
                next(response.success(docs));
            }).catch(function (err) {
                next(response.error('Failed to read data from ' + collectionName + ' of ' + dbName + ' for ' + err.message));
            });
        }
    }, {
        key: 'getAllBackupConfigs',
        value: function getAllBackupConfigs(next) {
            this.localDB.getBackupConfigs().then(function (backupConfigs) {
                next(response.success(backupConfigs));
            }).catch(function (err) {
                next(response.error('Failed to get all the backup configs for ' + err.message));
            });
        }
    }, {
        key: 'getBackupConfig',
        value: function getBackupConfig(backupId, next) {
            this.localDB.getBackupConfig(backupId).then(function (backupConfigs) {
                if (backupConfigs.length == 0) {
                    return next(response.success(null));
                }

                next(response.success(backupConfigs[0]));
            }).catch(function (err) {
                next(response.error('Failed to get ' + backupId + ' backup config for ' + err.message));
            });
        }
    }, {
        key: 'getBackupCopyDBs',
        value: function getBackupCopyDBs(backupID, next) {
            this.localDB.getBackupCopyDBsWithId(backupID).then(function (backupCopyDBs) {
                next(response.success(backupCopyDBs));
            }).catch(function (err) {
                next(response.error(err.message));
            });
        }
    }, {
        key: 'getAllBackupCopyDBs',
        value: function getAllBackupCopyDBs(next) {
            this.localDB.getAllCopyDBs().then(function (copyDBs) {
                next(response.success(copyDBs));
            }).catch(function (err) {
                next(response.error('Failed to get all copy dbs for ' + err.message));
            });
        }
    }, {
        key: 'getAllOriginalDBs',
        value: function getAllOriginalDBs(next) {
            var _this3 = this;

            Promise.all([].concat(_toConsumableArray(this.backUpsHash.keys())).map(function (key) {
                return _this3.backUpsHash.get(key).getOriginalDB();
            })).then(function (dbs) {
                return next(response.success(dbs));
            }).catch(function (err) {
                return next(response.error(err.message));
            });
        }
    }, {
        key: 'getOriginalDB',
        value: function getOriginalDB(backupID, next) {
            if (!this.backUpsHash.has(backupID)) {
                return next(response.error('backupID ' + backupID + ' doesn\'t exist', 404));
            }

            this.backUpsHash.get(backupID).getOriginalDB().then(function (db) {
                return next(response.success(db));
            }).catch(function (err) {
                return next(response.error(err.message));
            });
        }
    }, {
        key: 'getAllBackupLogs',
        value: function getAllBackupLogs(backupID, next) {
            this.localDB.getBackupLogs(backupID).then(function (logs) {
                return next(response.success(logs));
            }).catch(function (err) {
                return next(response.error(err.message));
            });
        }

        // when the whole backup system restart, need to read all the
        // backup config from the local mongoDB and restart the previous
        // backups

    }, {
        key: 'restart',
        value: function restart() {
            var _this4 = this;

            this.localDB.getBackupConfigs().then(function (backupConfigs) {
                if (backupConfigs.length == 0) {
                    return;
                }
                backupConfigs.map(function (backupConfig) {
                    log.info('Restarted ' + backupConfig.id + ' from ' + _this4.localDB.server + ' ' + _this4.localDB.configCollectionName);
                    var backupManager = object.selfish(new BackupManager(_this4.localDB, backupConfig, _this4.serverSocket));
                    log.debug('Added ' + backupConfig.id + ' to the backup controller');
                    _this4.backUpsHash.set(backupConfig.id, backupManager);
                    backupManager.restart();
                });
            });
        }
    }]);

    return Controller;
}();

// make sure there is only one controller in the application


var CONTROLLER_KEY = Symbol.for('controller');

if (!global[CONTROLLER_KEY]) {
    global[CONTROLLER_KEY] = object.selfish(new Controller());
}

module.exports = global[CONTROLLER_KEY];

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var object = {};

object.selfish = function (target) {
    var cache = new WeakMap();
    var handler = {
        get: function get(target, key) {
            var value = Reflect.get(target, key);
            if (typeof value != 'function') {
                return value;
            }
            if (!cache.has(value)) {
                cache.set(value, value.bind(target));
            }
            return cache.get(value);
        }
    };
    var proxy = new Proxy(target, handler);
    return proxy;
};

object.deployPromiseFinally = function () {
    Promise.prototype.finally = function (callback) {
        var P = this.constructor;
        return this.then(function (value) {
            return P.resolve(callback()).then(function () {
                return value;
            });
        }, function (reason) {
            return P.resolve(callback()).then(function () {
                throw reason;
            });
        });
    };
};

object.sortByTime = function (objects, key) {
    var reverse = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    return objects.sort(function (a, b) {
        var dateA = new Date(a[key]);
        var dateB = new Date(b[key]);
        var compare = dateA > dateB ? 1 : dateA < dateB ? -1 : 0;
        return reverse ? compare * -1 : compare;
    });
};

module.exports = object;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var backup = __webpack_require__(21);
var task = __webpack_require__(22);

var constants = {
    backup: backup,
    task: task
};

module.exports = constants;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var config = __webpack_require__(1).config;
var request = __webpack_require__(10);

var tokenManager = {

    localDB: null,

    setDB: function setDB(localDB) {
        tokenManager.localDB = localDB;
    },

    newToken: function newToken(req) {
        var token = {};

        token.crt = new Date().valueOf();
        token.exp_time = token.crt + config.auth.token_exp_time;
        token.token = tokenManager._generateToken();
        token.ip = request.getIp(req);
        token.user_agent = request.getUserAgent(req);
        token.valid = true;

        return token;
    },

    _generateToken: function _generateToken() {
        var token = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 64; ++i) {
            token += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return token;
    },

    setTokenToDB: function setTokenToDB(token) {
        return tokenManager.localDB.setToken(token);
    },

    getTokensFromDB: function getTokensFromDB(query) {
        return tokenManager.localDB.getToken(query);
    },

    invalidateTokens: function invalidateTokens(query) {
        return tokenManager.localDB.updateTokens({ '$set': { valid: false } }, query);
    }
};

module.exports = tokenManager;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongoClient = __webpack_require__(42).MongoClient;
var databaseUtil = __webpack_require__(37);
var object = __webpack_require__(5);
var databaseConfig = __webpack_require__(1).config.database;
var log = __webpack_require__(3);

var MongoDB = function () {
    function MongoDB(_ref) {
        var server = _ref.server,
            port = _ref.port,
            username = _ref.username,
            password = _ref.password,
            _ref$authDB = _ref.authDB,
            authDB = _ref$authDB === undefined ? 'admin' : _ref$authDB;

        _classCallCheck(this, MongoDB);

        this.db = null;
        this.dbHash = new Map();
        this.connections = 0;
        this.setConnectionParams({ server: server, port: port, username: username, password: password, authDB: authDB });
    }

    _createClass(MongoDB, [{
        key: 'setConnectionParams',
        value: function setConnectionParams(_ref2) {
            var server = _ref2.server,
                port = _ref2.port,
                username = _ref2.username,
                password = _ref2.password,
                _ref2$authDB = _ref2.authDB,
                authDB = _ref2$authDB === undefined ? 'admin' : _ref2$authDB;

            this.server = server;
            this.port = port;
            this.userName = username;
            this.password = password;
            this.authDB = authDB;
            this.url = databaseUtil.getMongoUri(username, password, server, port, authDB);
            return this;
        }
    }, {
        key: 'connect',
        value: function connect() {
            var _this = this;

            return Promise.resolve().then(function () {
                _this.connections++;

                if (_this.db) {
                    return;
                }

                return MongoClient.connect(_this.url).then(function (db) {
                    log.debug('connected to ' + _this.url);
                    _this.db = db;
                }).catch(function (err) {
                    log.error('Failed to connect to ' + _this.url + ' for ' + err.message);
                    throw new Error(err);
                });
            });
        }
    }, {
        key: 'close',
        value: function close() {
            var _this2 = this;

            return Promise.resolve().then(function () {
                _this2.connections--;

                if (_this2.connections > 0) {
                    log.debug('Some activities are still running, can\'t close the mongo connection');
                    return;
                }

                if (_this2.db == null) {
                    log.debug(_this2.url + ' is not connected');
                    return;
                }

                return _this2.db.close().then(function (result) {
                    _this2.db = null;
                    _this2.dbHash.clear();
                }).catch(function (err) {
                    log.error('Failed to close ' + _this2.url + ' for ' + err.message);
                    throw err;
                });
            });
        }
    }, {
        key: 'getUserRole',
        value: function getUserRole() {
            var _this3 = this;

            return Promise.resolve().then(function () {
                return _this3.db.command({ usersInfo: _this3.userName });
            }).catch(function (err) {
                log.error('Failed to get ' + _this3.userName + ' for ' + err.message);
                throw err;
            }).then(function (_ref3) {
                var users = _ref3.users;

                if (users.length == 0) {
                    throw new Error('no user ' + _this3.userName + ' found');
                }

                return users[0];
            });
        }
    }, {
        key: 'getAvailableDBsWithRoles',
        value: function getAvailableDBsWithRoles(rolesFilter) {
            var _this4 = this;

            return Promise.resolve().then(function () {
                return _this4.getUserRole();
            }).then(function (user) {
                return user.roles.filter(function (_ref4) {
                    var role = _ref4.role;
                    return rolesFilter.includes(role);
                }).map(function (_ref5) {
                    var db = _ref5.db;
                    return db;
                });
            });
        }
    }, {
        key: 'getAvailableDBsWithAdminDb',
        value: function getAvailableDBsWithAdminDb() {
            var _this5 = this;

            return Promise.resolve().then(function () {
                var adminDb = _this5.db.admin();
                return adminDb.listDatabases();
            }).then(function (_ref6) {
                var databases = _ref6.databases;

                return databases.map(function (_ref7) {
                    var name = _ref7.name;
                    return name;
                });
            }).catch(function (err) {
                log.error('Failed to get available backup dbs for ' + err.message);
                throw err;
            });
        }
    }, {
        key: 'getAvailableDBs',
        value: function getAvailableDBs() {
            var _this6 = this;

            return Promise.resolve().then(function () {
                var promise = null;
                if (!_this6.userName) {
                    promise = _this6.getAvailableDBsWithAdminDb();
                } else if (_this6.authDB == 'admin') {
                    promise = _this6.getUserRole().then(function (user) {
                        var filterRoles = user.roles.filter(function (_ref8) {
                            var role = _ref8.role,
                                db = _ref8.db;
                            return databaseConfig.all_database_backup_roles.includes(role);
                        });
                        if (filterRoles.length > 0) {
                            return _this6.getAvailableDBsWithAdminDb();
                        } else {
                            return [];
                        }
                    });
                } else {
                    promise = _this6.getAvailableDBsWithRoles(databaseConfig.database_backup_roles);
                }

                return promise;
            });
        }
    }, {
        key: 'getCollectionNamesWithDB',
        value: function getCollectionNamesWithDB(dbName) {
            var _this7 = this;

            return Promise.resolve().then(function () {
                return _this7.getDBByName(dbName).listCollections().toArray();
            }).then(function (collections) {
                return collections.filter(function (_ref9) {
                    var name = _ref9.name;
                    return !name.match(/system\.[\w+]+/);
                }).map(function (_ref10) {
                    var name = _ref10.name;
                    return name;
                });
            }).catch(function (err) {
                log.error('Failed to get all ' + dbName + ' collections for ' + err.message);
                throw err;
            });
        }
    }, {
        key: 'getAvailableBackupCollections',
        value: function getAvailableBackupCollections() {
            var _this8 = this;

            return Promise.resolve().then(function () {
                return _this8.getAvailableDBs();
            }).then(function (dbNames) {
                return Promise.all(dbNames.map(function (dbName) {
                    return new Promise(function (resolve, reject) {
                        _this8.getCollectionNamesWithDB(dbName).then(function (collections) {
                            return resolve({ db: dbName, collections: collections });
                        }).catch(function (err) {
                            return reject(err);
                        });
                    });
                }));
            });
        }
    }, {
        key: 'updateDocsInCollection',
        value: function updateDocsInCollection(dbName, collectionName, update, query) {
            var _this9 = this;

            var multi = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            return new Promise(function (resolve, reject) {
                _this9.getDBByName(dbName).collection(collectionName, { strict: false }, function (err, collection) {
                    if (err) {
                        return reject(err);
                    }

                    var operation = null;

                    if (!multi) {
                        operation = collection.updateOne(query, update, { upsert: true, w: 1 });
                    } else {
                        operation = collection.updateMany(query, update, { upsert: false });
                    }

                    operation.then(function (result) {
                        resolve();
                    }).catch(function (err) {
                        reject(err);
                    });
                });
            });
        }
    }, {
        key: 'readFromCollection',
        value: function readFromCollection(dbName, collectionName, filter) {
            var _this10 = this;

            return new Promise(function (resolve, reject) {
                _this10.getDBByName(dbName).collection(collectionName, { strict: false }, function (err, collection) {
                    if (err) {
                        return reject(err);
                    }
                    collection.find(filter).toArray(function (err, docs) {
                        if (err) {
                            return reject(err);
                        }
                        resolve(docs);
                    });
                });
            });
        }
    }, {
        key: 'readFromCollections',
        value: function readFromCollections(db, collections) {
            var _this11 = this;

            return Promise.resolve().then(function () {
                return Promise.all(collections.map(function (collection) {
                    return Promise.resolve().then(function () {
                        return _this11.readFromCollection(db, collection, {});
                    }).then(function (docs) {
                        log.debug('Read from ' + collection + ' of ' + db);
                        return { collection: collection, docs: docs };
                    }).catch(function (err) {
                        log.error('Failed to read from ' + collection + ' of ' + db + ' for ' + err.message);
                        throw err;
                    });
                }).map(function (p) {
                    return p.catch(function (e) {
                        return e;
                    });
                }));
            }).then(function (results) {
                var errors = results.filter(function (collectionDocs) {
                    return collectionDocs instanceof Error;
                });

                if (errors.length > 0) {
                    log.error('Failed to read all the data from ' + collections + ' of ' + db + ' for ' + errors[0].message);
                    throw errors[0];
                }

                log.debug('Finished read data from the ' + collections + ' of ' + db);
                return results;
            });
        }
    }, {
        key: 'writeToCollections',
        value: function writeToCollections(db, collectionsDocs) {
            var _this12 = this;

            return Promise.resolve().then(function () {
                return Promise.all(collectionsDocs.map(function (collectionDocs) {
                    return Promise.resolve().then(function () {
                        var collection = collectionDocs.collection,
                            docs = collectionDocs.docs;

                        return _this12.writeToCollection(db, collection, docs);
                    });
                }).map(function (p) {
                    return p.catch(function (e) {
                        return e;
                    });
                }));
            }).then(function (results) {
                var errors = results.filter(function (result) {
                    return result instanceof Error;
                });
                if (errors.length > 0) {
                    log.error('Failed to backup all the data to ' + db + ' for ' + errors[0].message);
                    throw errors[0];
                }
                log.debug('wrote all the data to ' + db);
            });
        }
    }, {
        key: 'writeToCollection',
        value: function writeToCollection(dbName, collectionName, docs) {
            var _this13 = this;

            return new Promise(function (resolve, reject) {
                _this13.getDBByName(dbName).collection(collectionName, { strict: false }, function (err, collection) {

                    if (err) {
                        log.err('Failed to write for ' + collectionName + ' of ' + dbName + ' for ' + err.message);
                        return reject(err);
                    }

                    if (docs.length == 0) {
                        log.debug(collectionName + ' is empty');
                        _this13.getDBByName(dbName).createCollection(collectionName).then(function () {
                            log.debug('Created empty ' + collectionName + ' in ' + dbName);
                            resolve();
                        }).catch(function (err) {
                            log.error('Failed to create empty ' + collectionName + ' in ' + dbName + ' for ' + err.message);
                            reject(err);
                        });
                    } else {
                        collection.insertMany(docs).then(function (result) {
                            log.debug('Wrote to ' + collectionName + ' of ' + dbName);
                            resolve();
                        }).catch(function (err) {
                            log.error('Failed to write to ' + collectionName + ' of ' + dbName + ' for ' + err.message);
                            reject(err);
                        });
                    }
                });
            });
        }
    }, {
        key: 'deleteDocs',
        value: function deleteDocs(dbName, collectionName, filter) {
            var _this14 = this;

            return new Promise(function (resolve, reject) {
                _this14.getDBByName(dbName).collection(collectionName, { strict: false }, function (err, collection) {
                    if (err) {
                        log.error('Failed to delete docs for ' + err.message);
                        return reject(err);
                    }

                    collection.deleteMany(filter).then(function () {
                        resolve();
                    }).catch(function (err) {
                        log.error('Failed to delete docs with ' + filter + ' for ' + err.message);
                        return reject(err);
                    });
                });
            });
        }
    }, {
        key: 'deleteDatabase',
        value: function deleteDatabase(dbName) {
            var _this15 = this;

            return Promise.resolve().then(function () {
                return _this15.getDBByName(dbName).dropDatabase();
            });
        }
    }, {
        key: 'deleteCollections',
        value: function deleteCollections(dbName, collectionNames) {
            var _this16 = this;

            return Promise.all(collectionNames.map(function (collectionName) {
                return _this16.getDBByName(dbName).dropCollection(collectionName).catch(function (err) {
                    // when the collection doesn't exist the delete action will throw a 'ns not found' error,
                    // need to skip this error
                    if (!err.message.includes('ns not found')) {
                        throw err;
                    }
                });
            }));
        }
    }, {
        key: 'getDBByName',
        value: function getDBByName(dbName) {
            if (!this.dbHash.has(dbName)) {
                this.dbHash.set(dbName, this.db.db(dbName));
            }

            return this.dbHash.get(dbName);
        }
    }]);

    return MongoDB;
}();

module.exports = MongoDB;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var request = {

    getIp: function getIp(req) {
        // get user ip adress from the request object
        return req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    },

    getUserAgent: function getUserAgent(req) {
        return req.headers['user-agent'];
    }
};

module.exports = request;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var object = __webpack_require__(5);
var log = __webpack_require__(3);
var task = __webpack_require__(13);
var constants = __webpack_require__(6);

var TaskPool = function () {
    function TaskPool() {
        _classCallCheck(this, TaskPool);

        this.taskSet = new Set();
    }

    _createClass(TaskPool, [{
        key: 'setController',
        value: function setController(controller) {
            this.controller = controller;
        }
    }, {
        key: 'start',
        value: function start(interval) {
            setInterval(this.scan.bind(this), interval);
        }
    }, {
        key: 'removeTasksWithBackupId',
        value: function removeTasksWithBackupId(backupId) {
            this.taskSet = new Set([].concat(_toConsumableArray(this.taskSet)).filter(function (task) {
                return task.backupId !== backupId;
            }));
        }
    }, {
        key: 'addTask',
        value: function addTask(task) {
            this.taskSet.add(task);
        }
    }, {
        key: 'scan',
        value: function scan() {
            log.debug('Start scanning the task pool at ' + new Date().toLocaleString());
            log.debug('whole task', this.taskSet);
            var tasks = this.getAvailableTasks();
            log.debug('avaliable task', tasks);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _task = _step.value;

                    this.executeTask(_task);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: 'getAvailableTasks',
        value: function getAvailableTasks() {
            var _this = this;

            var availableTasks = [];

            this.taskSet.forEach(function (task) {
                var now = new Date();
                var actionTime = new Date(task.time);

                if (now >= actionTime) {
                    availableTasks.push(task);
                    _this.taskSet.delete(task);
                }
            });

            return availableTasks;
        }
    }, {
        key: 'executeTask',
        value: function executeTask(availTask) {
            var backupManager = this.controller.getBackupManager(availTask.backupId);

            if (!backupManager) {
                log.error(availTask.backupId + ' doesn\'t exist!');
                return;
            }

            switch (availTask.action) {
                case constants.task.BACKUP:
                    // backup 
                    backupManager.backup();

                    var interval = availTask.details.interval;
                    if (interval) {
                        var nextBackupTime = new Date().valueOf() + interval;

                        var nextBackupTask = task.newTask(availTask.backupId, nextBackupTime, constants.task.BACKUP, { interval: interval });
                        this.addTask(nextBackupTask);

                        var nextBackupTimeStr = new Date(nextBackupTime).toLocaleString();
                        backupManager.updateBackupConfigToDB({ nextBackupTime: nextBackupTimeStr });
                    }

                    break;

                case constants.task.DELETE_DB:
                    var dbName = availTask.details.dbName;
                    backupManager.deleteCopyDB(dbName);
                    break;

                default:
                    break;
            }
        }
    }]);

    return TaskPool;
}();
// make sure there is only one task pool in the application


var TASKPOOL_KEY = Symbol.for('taskPool');

if (!global[TASKPOOL_KEY]) {
    global[TASKPOOL_KEY] = object.selfish(new TaskPool());
}

module.exports = global[TASKPOOL_KEY];

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var auth = {
    AUTH_ERROR: 'authentication error',
    CODE: 401
};

module.exports = auth;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var task = {

    newTask: function newTask(backupId, time, action, details) {
        var taskId = task.getTaskId();

        return {
            id: taskId,
            backupId: backupId,
            time: time,
            action: action,
            details: details
        };
    },

    getTaskId: function getTaskId() {
        var id = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 64; ++i) {
            id += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return id;
    }

};

module.exports = task;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*
    backup configuration:

    {
         id: crcdashboard@localhost,
         server: localhost,
         port: 27017,
         username: admin,
         password: admin,
         authDB: admin,
         db: crc,
         collections: [], // if not specified will backup all the collections
         startTime: the time of backup started, if not specified, started right now
         interval: millisecond interval for backup
         maxBackupNumber: 7// integer
         duration: millisecond of how long will the backup expire
    }

    backup_id: db_name@server

    backup databases

    {
          id: crcdashboard@localhost,
          originalDatabase: {
              server: localhost,
              database: crcdashboard
         }
          name: crcdashboard@localhost-timestamp,
          collections: [], the collection in the backup

          created_time: the time of the backup created
          deleted_time: the time of the backup will be deleted, calculated by duration time,
    }

    logs

    {
         id: crcdashboard@localhost,
         logs:[
             timestamp: the timestamp of the logging infomation,
             content: created backup configuration, deleted backup configuration, stop backup, backup successfully, backup failed: error message,                                  deleted database successfully, retore database successfully
         ]
    }
 */
var constants = __webpack_require__(6);

var backupUtil = {

    optionalKeys: ['collections', 'startTime', 'interval', 'maxBackupNumber', 'duration'],

    getBackupID: function getBackupID(backupConfig) {
        return backupConfig.db + '@' + backupConfig.server;
    },

    getNextBackupTime: function getNextBackupTime(backupConfig) {
        var startTime = backupConfig.startTime,
            nextBackupTime = backupConfig.nextBackupTime;


        var now = new Date();

        // try to get nextBackup time from nextBackupTime first
        if (nextBackupTime) {
            var nextBackupDateTime = new Date(nextBackupTime);
            if (nextBackupDateTime > now) {
                return nextBackupDateTime;
            }
        }

        if (startTime) {
            startTime = new Date(startTime);

            // if the original startTime has past, change it to today
            if (startTime < now) {
                startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds());

                if (startTime < now) {
                    // next Day
                    startTime = new Date(startTime.valueOf() + 24 * 60 * 60 * 1000);
                }
            }
        }

        if (!startTime) {
            startTime = now;
        }

        return startTime;
    },

    updateBackupData: function updateBackupData(backupConfig) {
        if (backupConfig.backupTotal == null) {
            backupConfig.status = constants.backup.status.PENDING;
            backupConfig.statistics = {
                total: 0,
                success: 0,
                failures: 0
            };

            backupConfig.createdTime = new Date().toLocaleString();
        }
    },
    updateBackupConfigFromUpdates: function updateBackupConfigFromUpdates(backupConfig, updates) {
        Object.assign(backupConfig, updates);
        // remove the optional key from backupConfig if necessary
        backupUtil.optionalKeys.forEach(function (key) {
            if (!(key in updates) && key in backupConfig) {
                delete backupConfig[key];
            }
        });
    }
};

module.exports = backupUtil;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MongoDB = __webpack_require__(9);
var databaseConfig = __webpack_require__(1).config.database;

var LocalDB = function (_MongoDB) {
    _inherits(LocalDB, _MongoDB);

    function LocalDB(_ref) {
        var server = _ref.server,
            port = _ref.port,
            username = _ref.username,
            password = _ref.password,
            _ref$authDB = _ref.authDB,
            authDB = _ref$authDB === undefined ? 'admin' : _ref$authDB;

        _classCallCheck(this, LocalDB);

        var _this = _possibleConstructorReturn(this, (LocalDB.__proto__ || Object.getPrototypeOf(LocalDB)).call(this, { server: server, port: port, username: username, password: password, authDB: authDB }));

        _this.backupConfigDBName = databaseConfig.backup_config_db || 'backup_config';
        _this.configCollectionName = "configurations";
        _this.logsCollectionName = "logs";
        _this.copyDBsCollectionName = "copyDatabases";
        _this.tokenCollectionName = "tokens";
        return _this;
    }

    _createClass(LocalDB, [{
        key: 'getBackupConfigs',
        value: function getBackupConfigs() {
            return this.readFromCollection(this.backupConfigDBName, this.configCollectionName, {});
        }
    }, {
        key: 'getBackupConfig',
        value: function getBackupConfig(backupID) {
            return this.readFromCollection(this.backupConfigDBName, this.configCollectionName, { id: backupID });
        }
    }, {
        key: 'getAllCopyDBs',
        value: function getAllCopyDBs() {
            return this.readFromCollection(this.backupConfigDBName, this.copyDBsCollectionName, {});
        }
    }, {
        key: 'getBackupCopyDBsWithId',
        value: function getBackupCopyDBsWithId(backupID) {
            return this.readFromCollection(this.backupConfigDBName, this.copyDBsCollectionName, { id: backupID });
        }
    }, {
        key: 'getBackupLogs',
        value: function getBackupLogs(backupID) {
            return this.readFromCollection(this.backupConfigDBName, this.logsCollectionName, { id: backupID });
        }
    }, {
        key: 'updateBackupConfig',
        value: function updateBackupConfig(backUpConfig) {
            return this.updateDocsInCollection(this.backupConfigDBName, this.configCollectionName, backUpConfig, { id: backUpConfig.id });
        }
    }, {
        key: 'updateCopyDB',
        value: function updateCopyDB(copyDB) {
            return this.updateDocsInCollection(this.backupConfigDBName, this.copyDBsCollectionName, copyDB, { id: copyDB.id, name: copyDB.name });
        }
    }, {
        key: 'addCopyDB',
        value: function addCopyDB(copyDB) {
            return this.writeToCollection(this.backupConfigDBName, this.copyDBsCollectionName, [copyDB]);
        }
    }, {
        key: 'addLog',
        value: function addLog(log) {
            return this.writeToCollection(this.backupConfigDBName, this.logsCollectionName, [log]);
        }
    }, {
        key: 'deleteCopyDBByIDAndName',
        value: function deleteCopyDBByIDAndName(id, name) {
            return this.deleteDocs(this.backupConfigDBName, this.copyDBsCollectionName, { id: id, name: name });
        }
    }, {
        key: 'deleteBackupConfig',
        value: function deleteBackupConfig(id) {
            return this.deleteDocs(this.backupConfigDBName, this.configCollectionName, { id: id });
        }
    }, {
        key: 'clearLogsByID',
        value: function clearLogsByID(id) {
            return this.deleteDocs(this.backupConfigDBName, this.logsCollectionName, { id: id });
        }
    }, {
        key: 'setToken',
        value: function setToken(token) {
            return this.writeToCollection(this.backupConfigDBName, this.tokenCollectionName, [token]);
        }
    }, {
        key: 'getToken',
        value: function getToken(query) {
            return this.readFromCollection(this.backupConfigDBName, this.tokenCollectionName, query);
        }
    }, {
        key: 'updateTokens',
        value: function updateTokens(update, query) {
            return this.updateDocsInCollection(this.backupConfigDBName, this.tokenCollectionName, update, query, true);
        }
    }]);

    return LocalDB;
}(MongoDB);

module.exports = LocalDB;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var api = __webpack_require__(31);
var bodyParser = __webpack_require__(39);
var logger = __webpack_require__(25);
var responseHandler = __webpack_require__(26);
var tokenHandler = __webpack_require__(27);
var frontend = __webpack_require__(33);
var user = __webpack_require__(35);
var cookieParser = __webpack_require__(40);
var router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());

//router.use('/', logger);
router.use(tokenHandler.validate);

router.get('/', function (req, res) {
   res.sendFile(frontend.indexFile);
});

router.use('/dist', frontend.publicPath);

router.use('/api', api);

router.use('/user', user);

router.use(responseHandler);

module.exports = router;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var start = function start(managerConfig) {
    // set configuraion
    var conf = __webpack_require__(1);
    conf.setConfig(managerConfig);
    var config = conf.config;

    var path = __webpack_require__(8);
    var express = __webpack_require__(0);
    var io = __webpack_require__(18);
    var http = __webpack_require__(17);
    var router = __webpack_require__(16);

    var object = __webpack_require__(5);
    var LocalDB = __webpack_require__(15);
    var backupController = __webpack_require__(4);
    var tokenManager = __webpack_require__(7);
    var taskPool = __webpack_require__(11);

    var app = express();
    var httpServer = http.createServer(app);
    var serverSocket = io(httpServer);

    object.deployPromiseFinally();

    serverSocket.on('connection', function () {});
    //Routers
    app.use('/', router);

    var localDB = object.selfish(new LocalDB(config.database));

    localDB.connect().then(function () {
        httpServer.listen(config.server.port, function (err, result) {
            if (err) {
                console.error('Failed to start the server for ' + err.message);
            } else {
                console.log('*'.repeat(60));
                console.log('MongoDB Backup Manager now is listening at ' + config.server.port + '!');
                console.log('*'.repeat(60));

                backupController.setLocalDB(localDB);
                backupController.setServerSocket(serverSocket);
                taskPool.setController(backupController);

                tokenManager.setDB(localDB);

                backupController.restart();
                taskPool.start(config.server.interval);
            }
        });
    }).catch(function (err) {
        localDB.close();
        process.exit(1);
    });
};

module.exports = {
    start: start
};

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var constants = __webpack_require__(6);
var log = __webpack_require__(3);
var config = __webpack_require__(1).config;
var MongoDB = __webpack_require__(9);
var object = __webpack_require__(5);
var backupUtil = __webpack_require__(14);
var task = __webpack_require__(13);
var taskPool = __webpack_require__(11);
var actions = __webpack_require__(6);

var BackupManager = function () {
    function BackupManager(localDB, backupConfig, serverSocket) {
        _classCallCheck(this, BackupManager);

        this.backupDB = object.selfish(new MongoDB(backupConfig));
        this.localDB = localDB;
        this.serverSocket = serverSocket;
        this.backupConfig = backupConfig;
        this.currentBackupCollections = null;
    }

    _createClass(BackupManager, [{
        key: 'start',
        value: function start() {
            if (!this.checkBackupAvailable()) {
                return;
            }

            var nextBackupTime = backupUtil.getNextBackupTime(this.backupConfig);
            this.updateBackupConfigToDB({
                nextBackupTime: nextBackupTime ? nextBackupTime.toLocaleString() : null,
                status: constants.backup.status.WAITING
            });

            var backupTask = task.newTask(this.backupConfig.id, nextBackupTime.valueOf(), constants.task.BACKUP, { interval: this.backupConfig.interval });

            taskPool.addTask(backupTask);
        }
    }, {
        key: 'resume',
        value: function resume() {
            var _this = this;

            // go back to the status before stop
            return this.updateBackupConfigToDB({
                status: this.backupConfig.statusBeforeStop,
                nextBackupTime: this.backupConfig.nextBackupTimeBeforeStop
            }).then(function () {
                return _this.restart();
            });
        }
    }, {
        key: 'restart',
        value: function restart() {
            if (this.backupStatus == constants.backup.status.STOP) {
                return;
            }

            this.start();
            this.deleteExtraCopyDBs();
            this.deleteOverdueCopyDBs();
        }
    }, {
        key: 'checkBackupAvailable',
        value: function checkBackupAvailable() {
            if (this.backupStatus == constants.backup.status.STOP) {
                return false;
            }

            return true;
        }
    }, {
        key: 'stop',
        value: function stop() {
            var _this2 = this;

            return Promise.resolve().then(function () {
                if (_this2.backupStatus == constants.backup.status.RUNNING) {
                    throw new Error('Failed to stop backup schedule, because backup is still running');
                }
            }).then(function () {
                return _this2.backupDB.close();
            }).then(function () {
                return _this2.updateBackupConfigToDB({
                    status: constants.backup.status.STOP,
                    nextBackupTime: null,
                    nextBackupTimeBeforeStop: _this2.backupConfig.nextBackupTime,
                    statusBeforeStop: _this2.backupConfig.status
                });
            }).then(function () {
                _this2.removeAllTasksFromTaskPool();
                return _this2.addLog('Stop all the backup tasks');
            }).catch(function (err) {
                _this2.addLog('Failed to stop backup for ' + err.message, 'error');
                throw err;
            });
        }
    }, {
        key: 'backup',
        value: function backup() {
            var _this3 = this;

            var now = new Date();
            var backupTargetDBName = this.getTargetBackUpDBName(now);
            var prevBackupStatus = this.backupConfig.status;

            return Promise.resolve().then(function () {
                if (prevBackupStatus == constants.backup.status.RUNNING) {
                    throw new Error('backup is running');
                }

                return _this3.addLog('Start to backup ' + _this3.backupConfig.db);
            }).then(this.backupDB.connect).then(function () {
                return _this3.updateBackupConfigToDB({ status: constants.backup.status.RUNNING });
            }).then(function () {
                return _this3.getBackupCollections();
            }).then(function (backupCollections) {
                log.debug('Successfully get backup collections ' + backupCollections + ' from ' + _this3.backupConfig.db);

                _this3.currentBackupCollections = backupCollections;
                return _this3.backupDB.readFromCollections(_this3.backupConfig.db, backupCollections);
            }).then(function (collectionsDocs) {
                _this3.backupDB.close().then(function () {
                    return log.debug('Closed ' + _this3.backupDB.url);
                }).catch(function (err) {
                    return log.error('Failed to close ' + _this3.backupDB.url + ' for ' + err.message);
                });
                return _this3.localDB.writeToCollections(backupTargetDBName, collectionsDocs);
            }).then(function () {
                return _this3.backupOnWriteSuccess(prevBackupStatus, backupTargetDBName);
            }).catch(function (err) {
                _this3.backupOnFailure(prevBackupStatus, err, backupTargetDBName);
                throw err;
            });
        }
    }, {
        key: 'restore',
        value: function restore(fromDB, collections) {
            var _this4 = this;

            return this.backupDB.connect().then(function () {
                return _this4.localDB.readFromCollections(fromDB, collections);
            }).then(function (collsDocs) {
                return _this4.backupDB.deleteCollections(_this4.backupConfig.db, collections).then(function () {
                    return _this4.backupDB.writeToCollections(_this4.backupConfig.db, collsDocs);
                });
            }).then(function () {
                return _this4.addLog('Retored ' + collections.join(' and ') + ' from ' + fromDB + ' to the ' + _this4.backupConfig.id + ' successfully');
            }).catch(function (err) {
                _this4.addLog('Failed to restore ' + collections.join(' and ') + ' from ' + fromDB + ' to ' + _this4.backupConfig.id + ' for ' + err.message);
                throw err;
            }).finally(function () {
                _this4.backupDB.close();
            });
        }
    }, {
        key: 'getNextStatus',
        value: function getNextStatus(prevStatus) {
            var nextStatus = prevStatus;

            if (prevStatus == constants.backup.status.WAITING && !this.backupConfig.interval) {
                nextStatus = constants.backup.status.PENDING;
            }

            return nextStatus;
        }
    }, {
        key: 'removeAllTasksFromTaskPool',
        value: function removeAllTasksFromTaskPool() {
            taskPool.removeTasksWithBackupId(this.backupConfig.id);
        }
    }, {
        key: 'backupOnWriteSuccess',
        value: function backupOnWriteSuccess(prevStatus, backupCopyDBName) {
            var _this5 = this;

            var now = new Date();
            var dbDuration = this.backupConfig.duration;
            var deleteTime = dbDuration ? new Date(now.valueOf() + dbDuration) : null;

            return this.addBackupCopyDB(backupCopyDBName, now, deleteTime).then(function () {
                return _this5.addLog('Backup ' + _this5.backupConfig.db + ' to ' + backupCopyDBName + ' successfully');
            }).then(function () {
                return _this5.deleteExtraCopyDBs();
            }).then(function () {
                if (deleteTime) {
                    var deleteTask = task.newTask(_this5.backupConfig.id, deleteTime.valueOf(), constants.task.DELETE_DB, { dbName: backupCopyDBName });
                    taskPool.addTask(deleteTask);

                    log.debug(backupCopyDBName + ' will be deleted at ' + deleteTime.toLocaleString());
                }

                return _this5.updateBackupConfigAfterBackup(prevStatus, constants.backup.result.SUCCEED);
            }).catch(function (err) {
                throw err;
            });
        }
    }, {
        key: 'backupOnFailure',
        value: function backupOnFailure(prevStatus, err, backupCopyDBName) {
            var _this6 = this;

            this.addLog('Backup ' + this.backupConfig.db + ' failed for ' + err.message, "error");
            return this.updateBackupConfigAfterBackup(prevStatus, constants.backup.result.FAILED).finally(function () {
                _this6.localDB.deleteCopyDB(backupCopyDBName);
            });
        }
    }, {
        key: 'updateBackupConfigAfterBackup',
        value: function updateBackupConfigAfterBackup(prevStatus, backupResult) {
            var statistics = this.backupConfig.statistics;
            statistics.total += 1;

            if (backupResult === constants.backup.result.SUCCEED) {
                statistics.success += 1;
            } else {
                statistics.failures += 1;
            }

            var lastBackupResult = backupResult;
            var nextStatus = this.getNextStatus(prevStatus);
            var lastBackupTime = new Date().toLocaleString();

            var updates = {
                lastBackupResult: lastBackupResult,
                statistics: statistics,
                status: nextStatus,
                lastBackupTime: lastBackupTime
            };

            return this.updateBackupConfigToDB(updates);
        }
    }, {
        key: 'getTargetBackUpDBName',
        value: function getTargetBackUpDBName(date) {
            return this.backupConfig.db + '-' + date.valueOf();
        }
    }, {
        key: 'getBackupCollections',
        value: function getBackupCollections() {
            var _this7 = this;

            return new Promise(function (resolve, reject) {
                if (_this7.backupConfig.collections) {
                    return resolve(_this7.backupConfig.collections);
                }

                _this7.backupDB.getCollectionNamesWithDB(_this7.backupConfig.db).then(function (collections) {
                    resolve(collections);
                }).catch(function (err) {
                    reject(err);
                });
            });
        }
    }, {
        key: 'getOriginalDB',
        value: function getOriginalDB() {
            var _this8 = this;

            return this.backupDB.connect().then(function () {
                return _this8.backupDB.getCollectionNamesWithDB(_this8.backupConfig.db);
            }).then(function (collections) {
                return {
                    id: _this8.backupConfig.id,
                    db: _this8.backupConfig.db,
                    collections: collections
                };
            }).finally(function () {
                _this8.backupDB.close();
            });
        }
    }, {
        key: 'getCollections',
        value: function getCollections(dbName) {
            var _this9 = this;

            if (dbName != this.backupConfig.db) {
                return this.localDB.getCollectionNamesWithDB(dbName).then(function (collections) {
                    return { db: dbName, collections: collections };
                });
            }

            return this.backupDB.connect().then(function () {
                return _this9.backupDB.getCollectionNamesWithDB(_this9.backupConfig.db);
            }).then(function (collections) {
                return { id: _this9.backupConfig.id, db: dbName, collections: collections };
            }).finally(function () {
                _this9.backupDB.close();
            });
        }
    }, {
        key: 'getDataFromCollection',
        value: function getDataFromCollection(dbName, collectionName, filter) {
            var _this10 = this;

            if (dbName != this.backupConfig.db) {
                return this.localDB.readFromCollection(dbName, collectionName, filter);
            }

            return this.backupDB.connect().then(function () {
                return _this10.backupDB.readFromCollection(dbName, collectionName, filter);
            }).finally(function () {
                _this10.backupDB.close();
            });
        }
    }, {
        key: 'addLog',
        value: function addLog(content) {
            var _this11 = this;

            var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "info";

            var newLog = {
                id: this.backupConfig.id,
                level: level,
                time: new Date().valueOf(),
                content: content
            };
            this.localDB.addLog(newLog).then(function () {
                log.debug('Added log ' + _this11.backupConfig.id);
            }).catch(function (err) {
                log.error('Failed to add log for ' + _this11.backupConfig.id + ' for ' + err.message);
                throw err;
            }).finally(function () {
                var eventName = _this11.backupConfig.id + '-logs';
                _this11.serverSocket.emit(eventName);
            });
        }
    }, {
        key: 'updateBackupConfig',
        value: function updateBackupConfig(updates) {
            var _this12 = this;

            // when update the backupConfig first
            // need to stop all the current activities
            var _backupConfig = this.backupConfig,
                id = _backupConfig.id,
                duration = _backupConfig.duration;

            backupUtil.updateBackupConfigFromUpdates(this.backupConfig, updates);

            return Promise.resolve().then(function () {
                return _this12.stop();
            }).then(function () {
                // use the update method provied by the localDB
                // for this kind of update
                return _this12.localDB.updateBackupConfig(_this12.backupConfig);
            }).then(function () {
                _this12.serverSocket.emit('backupConfigs', id);
            }).then(function () {
                _this12.backupDB.setConnectionParams(_this12.backupConfig);
                return _this12.updateBackupConfigToDB({ status: constants.backup.status.PENDING });
            }).then(function () {
                if (updates.hasOwnProperty('duration') && updates.duration !== duration) {
                    return _this12.localDB.getBackupCopyDBsWithId(id);
                } else {
                    return;
                }
            }).then(function (dbs) {
                if (dbs == null) {
                    return;
                }

                dbs.forEach(function (db) {
                    db.deletedTime = updates.duration ? new Date(new Date(db.createdTime).valueOf() + updates.duration).toLocaleString() : null;
                });

                return Promise.all(dbs.map(function (db) {
                    return _this12.localDB.updateCopyDB(db);
                }));
            }).then(function () {
                // notifiy the client side that copy dbs has been changed
                _this12.serverSocket.emit('copyDBs', id);
            }).then(function () {
                return _this12.restart();
            });
        }
    }, {
        key: 'updateBackupConfigToDB',
        value: function updateBackupConfigToDB(updates) {
            var _this13 = this;

            Object.assign(this.backupConfig, updates);
            return this.localDB.updateBackupConfig(this.backupConfig).finally(function () {
                _this13.serverSocket.emit('backupConfigs', _this13.backupConfig.id);
            });
        }
    }, {
        key: 'addBackupCopyDB',
        value: function addBackupCopyDB(copyDBName, createdTime, deletedTime) {
            var _this14 = this;

            var newBackupCopyDB = {
                id: this.backupConfig.id,
                originalDatabase: {
                    server: this.backupConfig.server,
                    database: this.backupConfig.db
                },
                name: copyDBName,
                collections: this.currentBackupCollections,
                createdTime: createdTime.toLocaleString(),
                deletedTime: deletedTime.toLocaleString()
            };
            return this.localDB.addCopyDB(newBackupCopyDB).finally(function () {
                _this14.serverSocket.emit('copyDBs', _this14.backupConfig.id);
            });
        }
    }, {
        key: 'deleteCopyDB',
        value: function deleteCopyDB(dbName) {
            var _this15 = this;

            log.debug('Started to delete ' + dbName);
            return this.localDB.deleteCopyDBByIDAndName(this.backupConfig.id, dbName).then(function () {
                return _this15.localDB.deleteDatabase(dbName);
            }).then(function () {
                var now = new Date();
                return _this15.addLog('Deleted ' + dbName + ' at ' + now.toLocaleString());
            }).catch(function (err) {
                _this15.addLog('Failed to delete ' + dbName + ' for ' + err.message, "error");
                throw err;
            }).finally(function () {
                _this15.serverSocket.emit('copyDBs', _this15.backupConfig.id);
            });
        }
    }, {
        key: 'deleteCopyDBs',
        value: function deleteCopyDBs(dbs) {
            var _this16 = this;

            // best effort delete dbs
            log.debug('Started to delete ' + dbs);
            if (dbs.length == 0) {
                return Promise.resolve();
            }
            return Promise.all(dbs.map(function (db) {
                return _this16.deleteCopyDB(db);
            }));
        }
    }, {
        key: 'deleteCollections',
        value: function deleteCollections(dbName, collections) {
            var _this17 = this;

            if (dbName != this.backupConfig.db) {
                return this.localDB.deleteCollections(dbName, collections).then(function () {
                    return _this17.addLog('Deleted ' + collections + ' of ' + dbName);
                }).catch(function (err) {
                    _this17.addLog('Failed to delete ' + collections + ' of ' + dbName + ' for ' + err.message + ' ', 'error');
                    throw err;
                });
            }

            return this.backupDB.connect().then(function () {
                return _this17.backupDB.deleteCollections(_this17.backupConfig.db, collections);
            }).finally(function () {
                _this17.backupDB.close();
            });
        }
    }, {
        key: 'deleteExtraCopyDBs',
        value: function deleteExtraCopyDBs() {
            var _this18 = this;

            return new Promise(function (resolve, reject) {
                var maxBackupNumber = _this18.backupConfig.maxBackupNumber;


                if (!maxBackupNumber) {
                    return resolve();
                }

                _this18.localDB.getBackupCopyDBsWithId(_this18.backupConfig.id).then(function (backupCopyDBs) {
                    var copyDBsNumber = backupCopyDBs.length;
                    if (copyDBsNumber <= maxBackupNumber) {
                        return resolve();
                    }
                    log.debug('Start to deleted ' + (copyDBsNumber - maxBackupNumber) + ' extra DBs');
                    backupCopyDBs = object.sortByTime(backupCopyDBs, "createdTime", true);
                    var extraCopyDBs = backupCopyDBs.slice(maxBackupNumber, copyDBsNumber);
                    return Promise.all(extraCopyDBs.map(function (copyDB) {
                        return _this18.deleteCopyDB(copyDB['name']);
                    }));
                }).then(function () {
                    resolve();
                }).catch(function (err) {
                    _this18.addLog('Failed to deleted extra backup copies for ' + err.message, 'error');
                    reject(err);
                });
            });
        }
    }, {
        key: 'deleteOverdueCopyDBs',
        value: function deleteOverdueCopyDBs() {
            var _this19 = this;

            return Promise.resolve().then(function () {
                return _this19.localDB.getBackupCopyDBsWithId(_this19.backupConfig.id);
            }).then(function (backupCopyDBs) {
                return Promise.all(backupCopyDBs.map(function (copyDB) {
                    var deletedTime = copyDB['deletedTime'];
                    var dbName = copyDB['name'];
                    if (deletedTime) {
                        var deleteTask = task.newTask(_this19.backupConfig.id, deletedTime, constants.task.DELETE_DB, { dbName: dbName });
                        taskPool.addTask(deleteTask);
                        log.debug(dbName + ' will be deleted at ' + deletedTime);
                    }
                    return Promise.resolve();
                }));
            }).catch(function (err) {
                log.error('Failed to deleted all the overdue databases for ' + _this19.backupConfig.id + ' for ' + err.message);
                throw err;
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            var _this20 = this;

            // clear logic, clear log, dbs,
            var id = this.backupConfig.id;

            return this.stop().then(function () {
                return _this20.localDB.getBackupCopyDBsWithId(id);
            }).then(function (dbs) {
                return _this20.deleteCopyDBs(dbs.map(function (db) {
                    return db.name;
                }));
            }).then(function () {
                return _this20.localDB.clearLogsByID(id);
            }).then(function () {
                return _this20.localDB.deleteBackupConfig(id);
            }).finally(function () {
                _this20.serverSocket.emit('backupConfigs', _this20.backupConfig.id);
            });
        }
    }, {
        key: 'backupStatus',
        get: function get() {
            return this.backupConfig.status;
        }
    }, {
        key: 'nextBackupTime',
        get: function get() {
            return this.backupConfig.nextBackupTime;
        }
    }]);

    return BackupManager;
}();

module.exports = BackupManager;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var backup = {

    status: {
        'PENDING': 'PENDING',
        'WAITING': 'WAITING',
        'RUNNING': 'RUNNING',
        'STOP': 'STOP'
    },

    result: {
        'SUCCEED': 'SUCCEED',
        'FAILED': 'FAILED'
    }

};

module.exports = backup;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var actions = {
    DELETE_DB: 'DELETE_DB',
    BACKUP: 'BACKUP'
};

module.exports = actions;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var userHelper = __webpack_require__(24);
var response = __webpack_require__(2);
var tokenManager = __webpack_require__(7);
var request = __webpack_require__(10);
var authError = __webpack_require__(12);

var userController = {

    localDB: null,

    validateUser: function validateUser(user, req, res, next) {
        if (userHelper.isAdmin(user)) {
            var t = tokenManager.newToken(req);

            tokenManager.setTokenToDB(t).then(function () {
                // set cookie
                res.cookie('token', t.token);
                // TODO return the role of admin user
                next(response.success(t));
            }, function (error) {
                next(response.error(error.message));
            });
        } else {
            next(response.error(authError.AUTH_ERROR, authError.CODE));
        }
    },

    logoutUser: function logoutUser(token, req, res, next) {
        var ip = request.getIp(req);
        var user_agent = request.getUserAgent(req);

        tokenManager.getTokensFromDB({
            token: token,
            ip: ip,
            user_agent: user_agent,
            valid: true
        }).then(function (tokens) {
            if (tokens.length === 0) {
                next(response.error(authError.AUTH_ERROR, authError.code));
                return;
            }

            return tokenManager.invalidateTokens({
                token: token,
                ip: ip,
                user_agent: user_agent,
                valid: true
            }).then(function () {
                res.cookie('token', null);
            });
        }).then(function () {
            next(response.success());
        }).catch(function (err) {
            next(response.error(authError.AUTH_ERROR, authError.CODE));
        });
    }
};

module.exports = userController;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var config = __webpack_require__(1).config;

var user = {

    isAdmin: function isAdmin(user) {
        // check if the user is admin
        return user.username == config.auth.username && user.password == config.auth.password;
    }

};

module.exports = user;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var log = __webpack_require__(3);

var logger = function logger(req, resp, next) {
    log.debug('Request from ' + req.originalUrl);
    next();
};

module.exports = logger;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var response = __webpack_require__(2);

var responseHandler = function responseHandler(data, req, res, next) {
    //console.log(data);
    response.send(res, data);
};

module.exports = responseHandler;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var response = __webpack_require__(2);
var request = __webpack_require__(10);
var tokenManager = __webpack_require__(7);
var authError = __webpack_require__(12);
var log = __webpack_require__(3);

var tokenHandler = {

    validate: function validate(req, res, next) {
        if (!tokenHandler.neededAuthenticated(req)) {
            return next();
        }

        var token = req.cookies.token;

        if (token == null) {
            response.send(res, response.error(authError.AUTH_ERROR, authError.CODE));
            return;
        }

        var ip = request.getIp(req);
        var user_agent = request.getUserAgent(req);
        var now = new Date().valueOf();

        tokenManager.getTokensFromDB({
            token: token,
            ip: ip,
            user_agent: user_agent,
            valid: true,
            exp_time: { '$gt': now }
        }).then(function (tokens) {
            if (tokens.length == 0) {

                throw undefined;
            }

            // token authenticated
            next();
        }).catch(function (error) {
            response.send(res, response.error(authError.AUTH_ERROR, authError.CODE));
        });
    },

    neededAuthenticated: function neededAuthenticated(req) {
        var url = req.originalUrl;

        if (url === '/' || url == '/user/auth/login' || url.indexOf('dist') >= 0) {
            // don't need to authenticate the request for frontend and sign in
            return false;
        }
        return true;
    }
};

module.exports = tokenHandler;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);

var response = __webpack_require__(2);
var backupController = __webpack_require__(4);
var backups = express.Router();

backups.post('/create', function (req, res, next) {
    var backupConfig = req.body;
    backupController.newBackup(backupConfig, next);
});

backups.get('/status', function (req, res, next) {
    var backupID = req.query.id;
    backupController.getBackupStatus(backupID, next);
});

backups.get('/configs', function (req, res, next) {
    backupController.getAllBackupConfigs(next);
});

backups.get('/config', function (req, res, next) {
    var backupID = req.query.id;
    backupController.getBackupConfig(backupID, next);
});

backups.post('/run', function (req, res, next) {
    var data = req.body;
    backupController.runBackup(data.id, next);
});

backups.patch('/update', function (req, res, next) {
    var backupID = req.body.id;
    var updates = req.body.updates;

    backupController.updateBackupConfig(backupID, updates, next);
});

backups.post('/stop', function (req, res, next) {
    var backupID = req.body.id;

    backupController.stop(backupID, next);
});

backups.post('/resume', function (req, res, next) {
    var backupID = req.body.id;

    backupController.resume(backupID, next);
});

backups.post('/restore', function (req, res, next) {
    var _req$body = req.body,
        id = _req$body.id,
        db = _req$body.db,
        collections = _req$body.collections;

    backupController.restore(id, db, collections, next);
});

backups.delete('/delete', function (req, res, next) {
    var id = req.query.id;


    backupController.deleteBackup(id, next);
});

backups.delete('/:backupID/databases/:dbName', function (req, res, next) {
    var backupID = req.params.backupID;
    var dbName = req.params.dbName;

    backupController.deleteCopyDB(backupID, dbName, next);
});

module.exports = backups;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var response = __webpack_require__(2);
var backupController = __webpack_require__(4);
var collections = express.Router();

collections.delete('/', function (req, res, next) {
    var data = req.body;
    var id = data.id,
        db = data.db,
        collections = data.collections;


    backupController.deleteCollections(id, db, collections, next);
});

collections.get('/', function (req, res, next) {
    var data = req.query;
    var id = data.id,
        db = data.db;


    backupController.getCollections(id, db, next);
});

collections.get('/data', function (req, res, next) {
    var data = req.query;
    var id = data.id,
        db = data.db,
        collection = data.collection;


    backupController.getDataFromCollection(id, db, collection, next);
});

module.exports = collections;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var response = __webpack_require__(2);
var backupController = __webpack_require__(4);
var databases = express.Router();

databases.get('/availableDBs', function (req, res, next) {
    var mongoParams = req.query;
    backupController.getAvailableDBsCollections(mongoParams, next);
});

databases.get('/copyDBs', function (req, res, next) {
    var backupID = req.query.id;

    backupController.getBackupCopyDBs(backupID, next);
});

databases.get('/originalDB', function (req, res, next) {
    var backupID = req.query.id;

    backupController.getOriginalDB(backupID, next);
});

databases.get('/allOriginalDBs', function (req, res, next) {
    backupController.getAllOriginalDBs(next);
});

databases.get('/allCopyDBs', function (req, res, next) {
    backupController.getAllBackupCopyDBs(next);
});

databases.delete('/', function (req, res, next) {
    var _req$query = req.query,
        id = _req$query.id,
        db = _req$query.db;


    backupController.deleteDB(id, db, next);
});

module.exports = databases;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var backups = __webpack_require__(28);
var database = __webpack_require__(30);
var collections = __webpack_require__(29);
var logs = __webpack_require__(32);

var api = express.Router();

api.use('/backups', backups);
api.use('/databases', database);
api.use('/collections', collections);
api.use('/logs', logs);

module.exports = api;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);

var backupController = __webpack_require__(4);

var logs = express.Router();

logs.get('/', function (req, res, next) {
    var backupID = req.query.id;

    backupController.getAllBackupLogs(backupID, next);
});

module.exports = logs;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var path = __webpack_require__(8);

var publicPath = express.static(path.join(__dirname, '../dist'));
var indexFile = path.join(__dirname, '../dist/index.html');

module.exports = {
    publicPath: publicPath,
    indexFile: indexFile
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var auth = express.Router();
var userController = __webpack_require__(23);

auth.post('/login', function (req, res, next) {
    var user = req.body;

    userController.validateUser(user, req, res, next);
});

auth.post('/logout', function (req, res, next) {
    var token = req.cookies.token;

    userController.logoutUser(token, req, res, next);
});

module.exports = auth;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var auth = __webpack_require__(34);
var operation = __webpack_require__(36);

var user = express.Router();

user.use('/auth', auth);
user.use('/operation', operation);

module.exports = user;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(0);
var operation = express.Router();

operation.post('/create', function (req, res, next) {});

operation.delete('remove', function (req, res, next) {});

module.exports = operation;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var database = {

    getMongoUri: function getMongoUri(username, password, server, port) {
        var authDB = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'admin';

        return 'mongodb://' + (username && password ? username + ':' + password + '@' : '') + (server + ':' + port + '/' + authDB);
    }

};

module.exports = database;

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = require("basic-logger");

/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = require("cookie-parser");

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = require("mongodb");

/***/ }),
/* 43 */
/***/ (function(module, exports) {

module.exports = require("strip-json-comments");

/***/ })
/******/ ]);