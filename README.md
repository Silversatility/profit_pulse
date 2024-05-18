# Profit Pulse

For running the project with Docker see below.

## Requirements

 - Python 3.6
 - Django 2.0.5
 - Celery 4.1.0

## Installation

 - create virtualenv
    - `virtualenv --python=python3.6 env`
 - activate virtualenv
    - `source env/bin/activate`
 - install pip dependencies
    - `pip install -r requirements.txt`
 - create the database in PostgreSQL. Any name will do. In this case, I used `profit_pulse`
    - `createdb profit_pulse
 - create `.env` file inside the root directory
 - inside `.env` file, define your environment settings like `DATABASE_URL`, etc. Please see https://django-environ.readthedocs.io/en/latest/ for more details:
    - `DATABASE_URL=psql://postgresusername:postgrespassword@127.0.0.1/profit_pulse`
    - `CELERY_BROKER_URL="redis://localhost:6379/0"`
 - migrate all migration files
    - `python manage.py migrate`

 - start celery workers and scheduled tasks
    - `celery -A profit_pulse.core worker -P eventlet -c <number of concurrent workers, ex. 500>`
    - `celery -A profit_pulse.core beat`
    
## Installation with Docker
1. Create an environment file (.env) with the desired database settings:
```
DB_NAME=profit_pulse
DB_USER=postgres
DB_PASS=password
DB_SERVICE=db
DB_PORT=5432
CELERY_BROKER_URL="redis://localhost:6379/0"
```

2. Run the project with `docker-compose -f docker-compose.dev.yml up -d`

3. Execute the seeding scripts with:
```bash
docker-compose -f docker-compose.dev.yml exec web bash -c "python manage.py createsu"
docker-compose -f docker-compose.dev.yml exec web bash -c "python manage.py test_import_dispense_history --file APG_Report-FULL.csv"
docker-compose -f docker-compose.dev.yml exec web bash -c "python manage.py loaddata local_application"
```

4. Navigate to `http://localhost:8001/dist/admin` and login with the newly created user
