#!/bin/bash

cd ~/profit_pulse/frontend/src/admin/ && npm install && npm run build && cd ~/profit_pulse/
cd ~/profit_pulse/frontend/src/credentialing/ && npm install && npm run build && cd ~/profit_pulse/
cd ~/profit_pulse/frontend/src/customer/ && npm install && npm run build && cd ~/profit_pulse/
pip install -r requirements.txt
python manage.py migrate
sudo supervisorctl restart all
sudo service nginx restart
