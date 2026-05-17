#!/usr/bin/env bash
# Run Supabase migrations in order using the Supabase CLI.
# Usage:
#   SUPABASE_DB_URL=postgresql://... ./scripts/migrate.sh
#
# Requires:
#   - Supabase CLI installed (npm install -g supabase or brew install supabase/tap/supabase)
#   - SUPABASE_DB_URL environment variable set to the direct connection string
#
# Make executable: chmod +x scripts/migrate.sh

set -euo pipefail

MIGRATIONS_DIR="supabase/migrations"

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "ERROR: SUPABASE_DB_URL is not set."
  echo "  Export your direct DB URL before running:"
  echo "  export SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
  exit 1
fi

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "ERROR: Migrations directory '$MIGRATIONS_DIR' not found."
  exit 1
fi

SQL_FILES=$(ls "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort)

if [[ -z "$SQL_FILES" ]]; then
  echo "No .sql files found in $MIGRATIONS_DIR"
  exit 0
fi

echo "Applying migrations from $MIGRATIONS_DIR..."
for file in $SQL_FILES; do
  echo "  -> $file"
  psql "$SUPABASE_DB_URL" -f "$file" || {
    echo "ERROR: Failed at $file"
    exit 1
  }
done
echo "All migrations applied successfully."
