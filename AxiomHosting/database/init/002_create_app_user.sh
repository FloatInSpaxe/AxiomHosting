#!/bin/sh
set -eu

if [ -z "${APP_DB_USER:-}" ] || [ -z "${APP_DB_PASSWORD:-}" ]; then
  echo "APP_DB_USER and APP_DB_PASSWORD are required" >&2
  exit 1
fi

psql --set=ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=app_user="$APP_DB_USER" \
  --set=app_password="$APP_DB_PASSWORD" <<-'EOSQL'
  SELECT format('CREATE ROLE %I LOGIN PASSWORD %L', :'app_user', :'app_password')
  WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = :'app_user') \gexec

  GRANT CONNECT ON DATABASE :"DBNAME" TO :"app_user";
  GRANT USAGE ON SCHEMA public TO :"app_user";
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO :"app_user";
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO :"app_user";

  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_user";
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO :"app_user";
EOSQL
