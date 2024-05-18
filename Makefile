rn_install:
	# you only need to run this once
	cd karis-mobile && npm install -g expo-cli | true
	cd karis-mobile && npm install -g eslint | true
	cd karis-mobile && npm install
	cd karis-mobile && npm install --save-dev eslint eslint-plugin-react babel-preset-expo babel-eslint
	cd karis-mobile && apm install linter-eslint

rn_start:
	cd karis-mobile && expo start

build:
	@docker-compose build

up:
	@docker-compose up -d

start:
	@docker-compose stop
	@docker-compose up

req:
	@docker-compose exec web bash -c "pip install -r requirements.txt"

migrate:
	@docker-compose exec web bash -c "python manage.py makemigrations"
	@docker-compose exec web bash -c "python manage.py migrate"

stop:
	@docker-compose stop

static:
	@docker-compose exec web bash -c "python manage.py collectstatic --noinput"

seed:
	@docker-compose exec web bash -c "python manage.py createsu"
	@docker-compose exec web bash -c "python manage.py test_import_dispense_history --file APG_Report-FULL.csv"
	@docker-compose exec web bash -c "python manage.py loaddata local_application"

import:
	@docker-compose exec web bash -c "python manage.py createsu"
	@docker-compose exec web bash -c "python manage.py trigger_import"
	@docker-compose exec web bash -c "python manage.py loaddata local_application"

import_customer:
	@docker-compose exec web bash -c "python manage.py createsu"
	@docker-compose exec web bash -c "python manage.py trigger_import_by_customer"
	@docker-compose exec web bash -c "python manage.py loaddata local_application"

rm:
	@docker-compose stop
	@docker-compose rm -f
	@docker volume prune -f
	rm -f sqlite3.db

reset:
	$(MAKE) rm
	$(MAKE) up
	$(MAKE) req
	$(MAKE) static
	# $(MAKE) migrate
	# $(MAKE) seed

shell:
	@docker-compose exec web bash -c "python manage.py shell"

bash:
	@docker-compose exec web bash

stage-configure:
	@docker-compose exec web bash -c "eb init"
	@docker-compose exec web bash -c "aws configure"

stage-deploy:
	@docker-compose exec web bash -c "eb deploy"
	@docker-compose exec node bash -c "cd frontend/src/admin/ && npm run build:dev"
	@docker-compose exec web bash -c "aws s3 sync --acl public-read frontend/dist/admin/ s3://profit_pulse-frontend/"
	@docker-compose exec web bash -c "aws s3 sync --acl public-read frontend/assets/ s3://profit_pulse-frontend/assets/"
	@docker-compose exec node bash -c "cd frontend/src/customer/ && npm run build:dev"
	@docker-compose exec web bash -c "aws s3 sync --acl public-read frontend/dist/customer/ s3://profit_pulse-customer-dev/"
	@docker-compose exec web bash -c "aws s3 sync --acl public-read frontend/assets/ s3://profit_pulse-customer-dev/assets/"
