#!/bin/bash
# Read SUPABASE_DB_PASSWORD from .env
DB_PASSWORD=$(grep "^SUPABASE_DB_PASSWORD=" .env | cut -d'=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DB_PASSWORD" ]; then
  echo "ERROR: SUPABASE_DB_PASSWORD is not set in your .env file."
  exit 1
fi

echo "Connecting and applying migration to Supabase using pooler connection..."
# Run the migration using the pooler port 6543
npx supabase db query --db-url "postgresql://postgres.ikngjhpguvlmstztaxwt:$DB_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f "./supabase/migrations/20260713180000_sync_auth_admin_trigger.sql"
