#!/bin/bash

while true; do
    echo -e "\ndocker_bootstrap here: waiting for DB to be ready..." && sleep 5

    python3 manage.py migrate

    echo -e "\n(*) DEVELOPMENT_MODE: Starting runserver..."
    python3 manage.py runserver 0.0.0.0:8000
    echo -e "\n(!) Server exited with RC=$?. Restarting..."
done
