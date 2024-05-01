stop-all-processes:
	echo "Stopping all processes"
	pm2 stop all

backup-db:
	echo "Backing up databases"
	cp audit/prisma/dev.db ../backup/audit/dev.db
	cp devices/prisma/dev.db ../backup/devices/dev.db
	cp environments/prisma/dev.db ../backup/environments/dev.db
	cp users/prisma/dev.db ../backup/users/dev.db

git-pull: 
	echo "Pulling from git"
	git stash && git pull

restore-db:
	echo "Restoring databases"
	cp ../backup/audit/dev.db audit/prisma && cd audit/prisma && npx prisma generate
	cp ../backup/devices/dev.db devices/prisma && cd devices/prisma && npx prisma generate
	cp ../backup/environments/dev.db environments/prisma && cd environments/prisma && npx prisma generate
	cp ../backup/users/dev.db users/prisma && cd users/prisma && npx prisma generate

build-all-services:
	echo "Building all services"
	cd audit && npm install && npm run build 
	cd devices && npm install && npm run build
	cd environments && npm install && npm run build
	cd users && npm install && npm run build
	cd tokenization && npm install && npm run build
	cd access && npm install && npm run build
	cd gateway && npm install && npm run build

start-all-processes:
	echo "Starting all processes"
	pm2 start all

deploy: stop-all-processes backup-db git-pull restore-db build-all-services start-all-processes

cd:
	ssh hilquias@laica.ifrn.edu.br 'cd /home/hilquias/deploy/Access-control-microservices-monorepo && make deploy'

init:
	echo "Initializing services"
	cd audit && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js
	cd devices && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js
	cd environments && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js
	cd users && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js
	cd tokenization && npm install && npm run build && pm2 start ecosystem.config.js
	cd access && npm install && npm run build && pm2 start ecosystem.config.js
	cd gateway && npm install && npm run build && pm2 start ecosystem.config.js

test: backup-db git-pull restore-db init