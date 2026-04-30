#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 backups/YYYY-MM-DD_HH-MM-SS"
  exit 1
fi

BACKUP_PATH="$1"

if [ ! -d "$BACKUP_PATH" ]; then
  echo "[ERROR] Backup folder not found: $BACKUP_PATH"
  exit 1
fi

if [ ! -f "$BACKUP_PATH/postgres.dump" ]; then
  echo "[ERROR] Missing PostgreSQL dump: $BACKUP_PATH/postgres.dump"
  exit 1
fi

if [ ! -f "$BACKUP_PATH/minio-data.tar" ]; then
  echo "[ERROR] Missing MinIO archive: $BACKUP_PATH/minio-data.tar"
  exit 1
fi

echo "[WARN] This operation will replace current PostgreSQL and MinIO data."
read -r -p "Type RESTORE to continue: " CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then
  echo "[INFO] Restore cancelled."
  exit 0
fi

echo "[INFO] Stopping app and nginx to avoid active writes..."
docker compose stop app nginx || true

echo "[INFO] Ensuring db and minio are running..."
docker compose up -d db minio

echo "[INFO] Restoring PostgreSQL dump..."
docker compose exec -T db psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS kgwiki;"
docker compose exec -T db psql -U postgres -d postgres -c "CREATE DATABASE kgwiki;"
cat "$BACKUP_PATH/postgres.dump" | docker compose exec -T db pg_restore -U postgres -d kgwiki --clean --if-exists --no-owner --no-privileges

echo "[INFO] Restoring MinIO files..."
docker compose exec -T minio sh -c 'rm -rf /data/*'
cat "$BACKUP_PATH/minio-data.tar" | docker compose exec -T minio sh -c 'tar -C /data -xf -'

if [ -f "$BACKUP_PATH/.env" ]; then
  echo "[INFO] Backup contains .env: $BACKUP_PATH/.env"
  echo "[INFO] For safety, .env is not overwritten automatically."
  echo "[INFO] If needed, manually restore with: cp $BACKUP_PATH/.env ./.env"
else
  echo "[INFO] Backup does not contain .env"
fi

echo "[INFO] Starting full stack..."
docker compose up -d

echo "[INFO] Restore completed successfully from: $BACKUP_PATH"
