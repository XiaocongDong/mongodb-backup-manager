const database = {
    server: 'localhost',
    port: 27017,
    // username: 'supervisor',
    // password: '137800',
    backup_config_db: 'backup',
    // the roles that can backup the specific
    database_backup_roles: ['readWrite', 'dbOwner'],
    // the roles that can backup all the database
    all_database_backup_roles: ['readWriteAnyDatabase']
};

module.exports = database;
