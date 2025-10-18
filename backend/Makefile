dev:
	docker-compose up -d
	
dev-down:
	docker-compose down

dev-stop:
	docker-compose stop

migrate-up:
	sqlx migrate run

migrate-down:
	sqlx migrate revert

start:
	cargo watch -q -c -w src/ -x run
