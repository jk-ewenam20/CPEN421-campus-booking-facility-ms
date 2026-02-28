#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Database URL resolution
#
# Render's managed PostgreSQL provides DATABASE_URL as:
#   postgresql://user:password@host:port/dbname
#
# Spring Boot JDBC needs:
#   jdbc:postgresql://user:password@host:port/dbname
#
# Resolution order:
#   1. SPRING_DATASOURCE_URL  (explicit, already in JDBC format)
#   2. DB_URL                 (explicit, already in JDBC format)
#   3. DATABASE_URL           (Render-provided, auto-prefixed with "jdbc:")
# ─────────────────────────────────────────────────────────────────────────────
if [ -z "${SPRING_DATASOURCE_URL}" ]; then
  if [ -n "${DB_URL}" ]; then
    export SPRING_DATASOURCE_URL="${DB_URL}"
  elif [ -n "${DATABASE_URL}" ]; then
    # Render gives postgresql://... — JDBC driver needs jdbc:postgresql://...
    export SPRING_DATASOURCE_URL="jdbc:${DATABASE_URL}"
  else
    echo "ERROR: No database URL configured."
    echo "  Set DATABASE_URL (Render managed postgres) or DB_URL (external postgres)."
    exit 1
  fi
fi

# ─── Credentials ─────────────────────────────────────────────────────────────
# Use explicit vars first, then fall back to Render's PG* vars.
# If credentials are embedded in the JDBC URL they are still honoured by the driver.
export SPRING_DATASOURCE_USERNAME="${DB_USERNAME:-${PGUSER:-}}"
export SPRING_DATASOURCE_PASSWORD="${DB_PASSWORD:-${PGPASSWORD:-}}"

echo "INFO: Starting facility-booking-ms on port ${PORT:-8080} ..."

exec java \
  -Dspring.profiles.active=prod \
  -Dserver.port="${PORT:-8080}" \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -jar /app/app.jar
