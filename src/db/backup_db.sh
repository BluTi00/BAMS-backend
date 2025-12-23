#!/bin/bash

# Variables
DB_NAME="your_database_name"
DB_USER="your_postgres_username"
BACKUP_DIR="/path_to_store_backup"
DATE=$(date +"%Y%m%d%H%M")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.backup"

# Run pg_dump
pg_dump -U $DB_USER -h localhost -d $DB_NAME -F c -b -v -f $BACKUP_FILE

# Optional: Delete old backups older than 7 days
find $BACKUP_DIR -type f -name "*.backup" -mtime +7 -exec rm {} \;
