setlocal
@echo off
REM This script sets the MovR application database to the 
REM correct state to run the application at a given
REM stage of development.

REM Usage:
REM db-setup --% '<connection-url>'

REM datasets is the list of data sets to load after the required
REM database schema is created.
REM This list will vary for different labs.

set datasets=vehicles_data_with_lat_long.sql

REM Get the location of this script so that we can use it
REM to find the relative location of the metadata script
REM and the data directory
set run_dir=%CD%
set dbinit_script=%run_dir%\dbinit.sql
set data_dir="%run_dir%\..\data"

REM Log file for SQL output
set log_file=db-setup.log

REM The user must provide CRDB connection string parameter
REM of the form: 
REM 'postgres:REMusername:password@crdb-hostname:port/dbname?...'
REM Username and password must be included in the URL!

set url=%1%

echo Using connection string [%url%]
echo
REM Start log file output
echo Starting at %date% %time% > %log_file%

REM Set up metadata for this lab
echo Setting up tables: %dbinit_script%
cockroach sql --url=%url% < %dbinit_script% >> %log_file%

for %%d in ( %datasets% ) do (
        echo %time%: Loading %data_dir%\%%d
        REM echo %time%: cockroach sql --url %url% %data_dir%\%dataset% >> %logfile%
        cockroach sql --url=%url% < %data_dir%\%%d >> %log_file%
       )

echo Database setup for this lab is complete.
echo For details, view %log_file%.
