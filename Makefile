stop-all-processes: 
	pm2 stop all

backup-db:
	cp audit/prisma/dev.db ../backup/audit
	cp devices/prisma/dev.db ../backup/devices
	cp environments/prisma/dev.db ../backup/environments
	cp users/prisma/dev.db ../backup/users

git-pull: 
	git stash && git pull

restore-db:
	cp ../backup/audit/dev.db audit/prisma && cd audit/prisma && npx prisma generate
	cp ../backup/devices/dev.db devices/prisma && cd devices/prisma && npx prisma generate
	cp ../backup/environments/dev.db environments/prisma && cd environments/prisma && npx prisma generate
	cp ../backup/users/dev.db users/prisma && cd users/prisma && npx prisma generate

build-all-services:
	cd audit && npm install && npm run build 
	cd devices && npm install && npm run build
	cd environments && npm install && npm run build
	cd users && npm install && npm run build
	cd tokenization && npm install && npm run build
	cd access && npm install && npm run build
	cd gateway && npm install && npm run build

start-all-processes:
	pm2 start all

deploy: stop-all-processes backup-db git-pull restore-db build-all-services start-all-processes

cd:
	ssh hilquias@laica.ifrn.edu.br 'cd /home/hilquias/deploy/Access-control-microservices-monorepo && make deploy'
