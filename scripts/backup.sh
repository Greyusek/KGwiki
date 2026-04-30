#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
BACKUP_DIR="$ROOT_DIR/backups/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"

echo "[INFO] Starting backup: $BACKUP_DIR"

if ! docker compose ps db >/dev/null 2>&1; then
  echo "[ERROR] Docker Compose service 'db' not found."
  exit 1
fi

if ! docker compose ps minio >/dev/null 2>&1; then
  echo "[ERROR] Docker Compose service 'minio' not found."
  exit 1
fi

DB_CONTAINER="$(docker compose ps -q db)"
MINIO_CONTAINER="$(docker compose ps -q minio)"

if [ -z "$DB_CONTAINER" ]; then
  echo "[ERROR] 'db' container is not running. Start stack with: docker compose up -d"
  exit 1
fi

if [ -z "$MINIO_CONTAINER" ]; then
  echo "[ERROR] 'minio' container is not running. Start stack with: docker compose up -d"
  exit 1
fi

echo "[INFO] Creating PostgreSQL dump..."
docker compose exec -T db pg_dump -U postgres -d kgwiki -Fc > "$BACKUP_DIR/postgres.dump"

echo "[INFO] Archiving MinIO data from container..."
docker compose exec -T minio sh -c 'tar -C /data -cf - .' > "$BACKUP_DIR/minio-data.tar"

if [ -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env" "$BACKUP_DIR/.env"
  echo "[INFO] Copied .env"
else
  echo "[WARN] .env not found in project root."
fi

cp "$ROOT_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml"

cat > "$BACKUP_DIR/README.txt" <<MANIFEST
KGwiki backup created at: $TIMESTAMP

Contents:
- postgres.dump      PostgreSQL dump in custom format (pg_restore compatible)
- minio-data.tar     Tar archive of MinIO object data from /data
- .env               Environment file copy (if present at backup time)
- docker-compose.yml Compose file snapshot

Restore:
Run from repository root:
./scripts/restore.sh backups/$TIMESTAMP
MANIFEST

echo "[INFO] Backup completed successfully: $BACKUP_DIR"
