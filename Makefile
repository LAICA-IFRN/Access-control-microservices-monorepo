stop-all-processes: 
	pm2 stop all

backup-db:
	cp audit/prisma/dev.db ../backup/test/audit
	cp devices/prisma/dev.db ../backup/test/devices
	cp environments/prisma/dev.db ../backup/test/environments
	cp users/prisma/dev.db ../backup/test/users

git-pull: 
	git stash && git pull

build:
	cd audit && npm install && npm run build 
	cd devices && npm install && npm run build
	cd environments && npm install && npm run build
	cd users && npm install && npm run build
	cd tokenization && npm install && npm run build
	cd access && npm install && npm run build
	cd gateway && npm install && npm run build


restore-db:
	cp ../backup/test/audit/dev.db audit/prisma
	cp ../backup/test/devices/dev.db devices/prisma
	cp ../backup/test/environments/dev.db environments/prisma
	cp ../backup/test/users/dev.db users/prisma

start-all-processes:
	pm2 start all

deploy: stop-all-processes backup-db git-pull build restore-db start-all-processes

cd:
	ssh hilquias@laica.ifrn.edu.br 'cd /home/hilquias/deploy/Access-control-microservices-monorepo && make deploy'
