delete-all-processes:
	echo "Deleting all processes"
	pm2 del all
	pm2 save

backup-db:
	echo "Backing up databases"
	cp audit/prisma/dev.db ../backup/audit/
	cp devices/prisma/dev.db ../backup/devices/
	cp environments/prisma/dev.db ../backup/environments/
	cp users/prisma/dev.db ../backup/users/

git-pull: 
	echo "Pulling from git"
	git stash && git pull

restore-db:
	echo "Restoring databases"
	cp ../backup/audit/dev.db audit/prisma && cd audit/prisma && npx prisma generate
	cp ../backup/devices/dev.db devices/prisma && cd devices/prisma && npx prisma generate
	cp ../backup/environments/dev.db environments/prisma && cd environments/prisma && npx prisma generate
	cp ../backup/users/dev.db users/prisma && cd users/prisma && npx prisma generate

start-all-processes:
	echo "Building all services"
	cd audit && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js && pm2 save 
	cd devices && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js && pm2 save
	cd environments && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js && pm2 save
	cd users && npm install && npx prisma generate && npm run build && pm2 start ecosystem.config.js && pm2 save
	cd tokenization && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
	cd access && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save
	cd gateway && npm install && npm run build && pm2 start ecosystem.config.js && pm2 save

deploy: delete-all-processes backup-db git-pull restore-db start-all-processes

cd:
	ssh hilquias@laica.ifrn.edu.br 'cd /home/hilquias/deploy/Access-control-microservices-monorepo && make deploy'
