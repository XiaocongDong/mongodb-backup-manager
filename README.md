# 🌿 MongoDB Backup Manager
MongoDB backup manager (MDBBM) is a full-stack system that you can backup and restore multiple MongoDBs. With MDBBM you can:
* Create a backup schedule to backup your database at a given frequency ( XX days XX hours XX minutes XX seconds).
* Get the real-time information of the backup status, copy databases number and backup logs, etc.
* Manage multiple backup schedules at the same time.
* Stop, resume and update the backup schedule whenever you want.
* View the database data online.
* Restore the backup data back to the target database.
![UI](https://xiaocongdong.github.io/mongodb-backup-manager/static/img/new_config.png)
## Docs
homepage: [mongodb-backup-manager](https://xiaocongdong.github.io/mongodb-backup-manager/#)
## Get Started
1. Install MDBBM.
```baseh
# install MDBBM globally
npm install mongob-backup-manager -g 

# run MDBBM with optional arguments
mongodb-backup-manager
```
2. Visit and login MDBBM
go to http://localhost:8082, login with username: admin, password: admin
**Notes** 8082 and the admin/admin are the default configuration of the MDBBM if you want to run it with other options, 
please take a look at [System Configuration](https://xiaocongdong.github.io/mongodb-backup-manager/#/docs?tab=setup).
## Notes
MDBBM use a MongoDB to store all the backup data, you can either connect MDBBM to your local database or remote database. If you haven't install MongoDB in your local environment please follow the guidlines in [MongoDB](https://www.mongodb.com) to download and install it.
