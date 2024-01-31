#!/usr/bin/env bash

# This script sets the MovR application database to the 
# correct state to run the application at a given
# stage of development.

# Usage:
# db-setup.sh '<connection-url>'

# datasets is the list of data sets to load after the required
# database schema is created.
# This list will vary for different labs.
datasets=( 
	vehicles_data.sql 
	location_history_data.sql 
)

# Get the location of this script so that we can use it
# to find the relative location of the metadata script
# and the data directory
run_dir=`dirname $0`
dbinit_script="$run_dir/dbinit.sql"
data_dir=$run_dir/../data

# Log file for SQL output
log_file=db-setup.log

# The user must provide CRDB connection string parameter
# of the form: 
# 'postgres://username:password@crdb-hostname:port/dbname?...'
# Username and password must be included in the URL!

if [ "$#" -ne 1 ] 
then
	echo "Usage:"
	echo "    db-setup.sh '<connection-url>'"
	exit 1;
fi

url=$1

echo "Using connection string [$url]"

# Start log file output
echo "Starting $0 at `date`" > $log_file

# Set up metadata for this lab
echo "Executing [$dbinit_script]"
echo "`date`: cockroach sql --url $url < $dbinit_script" >> $log_file
cockroach sql --url $url < $dbinit_script >> $log_file

# Run scripts to load dataset as required for this lab
for dataset in "${datasets[@]}"
do
	echo "Loading [$data_dir/$dataset]"
	echo "`date`: cockroach sql --url $url < $data_dir/$dataset" >> $log_file
	cockroach sql --url $url < $data_dir/$dataset >> $log_file
done

echo "Database setup for this lab is complete."
echo "For details, view $log_file."
