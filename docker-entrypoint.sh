#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Resolve the JDBC database URL.
#
# Render's managed PostgreSQL injects DATABASE_URL as:
#   postgresql://user:password@host:port/dbname    (or postgres://)
#
# Spring Boot / HikariCP needs:
#   jdbc:postgresql://user:password@host:port/dbname
#
# Resolution order:
#   1. DB_URL             — explicit JDBC URL you set on Render
#   2. DATABASE_URL       — Render-injected URL, automatically converted
# ─────────────────────────────────────────────────────────────────────────────
if [ -n "${DB_URL}" ]; then
  JDBC_URL="${DB_URL}"
elif [ -n "${DATABASE_URL}" ]; then
  # Normalise postgres:// → postgresql://  then prepend jdbc:
  NORMALIZED="${DATABASE_URL}"
  case "${NORMALIZED}" in
    postgres://*) NORMALIZED="postgresql://${NORMALIZED#postgres://}" ;;
  esac
  JDBC_URL="jdbc:${NORMALIZED}"
else
  echo "ERROR: No database URL found."
  echo "  Option A: Link a Render PostgreSQL service (auto-sets DATABASE_URL)."
  echo "  Option B: Set DB_URL manually, e.g. jdbc:postgresql://host:5432/mydb?user=u&password=p"
  exit 1
fi

# ─── Credentials ─────────────────────────────────────────────────────────────
# Credentials can be embedded in the URL (Render managed postgres does this),
# or supplied separately via PG* vars that Render also injects.
DB_USER="${DB_USERNAME:-${PGUSER:-}}"
DB_PASS="${DB_PASSWORD:-${PGPASSWORD:-}}"

echo "INFO: Starting on port ${PORT:-8080}, datasource host resolved."

# Pass everything as JVM -D system properties — highest priority in Spring Boot,
# guaranteed to override anything in application-prod.properties.
exec java \
  -Dspring.profiles.active=prod \
  -Dserver.port="${PORT:-8080}" \
  -Dspring.datasource.url="${JDBC_URL}" \
  -Dspring.datasource.username="${DB_USER}" \
  -Dspring.datasource.password="${DB_PASS}" \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -jar /app/app.jar
