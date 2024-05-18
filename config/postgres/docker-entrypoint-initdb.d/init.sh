#!/bin/env bash
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || psql -h localhost -U postgres -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';"
psql -U postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER"