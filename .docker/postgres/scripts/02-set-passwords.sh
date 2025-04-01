#!/bin/bash
set -eux

# Funzione per impostare password con fallback
set_password() {
    local role="$1"
    local specific_var="$2"
    local password="${!specific_var:-$POSTGRES_PASSWORD}"
    psql -c "ALTER ROLE $role WITH PASSWORD '$password';"
}

# Attendi che il database sia pronto
until pg_isready; do
    sleep 1
done

# Imposta le password usando variabili d'ambiente con fallback
set_password "postgres" "POSTGRES_PASSWORD"
set_password "app_admin" "APP_ADMIN_PASSWORD"
set_password "authenticator" "AUTHENTICATOR_PASSWORD"
set_password "app_connect" "APP_CONNECT_PASSWORD"
set_password "app_read_only" "APP_READ_ONLY_PASSWORD"
set_password "app_writer" "APP_WRITER_PASSWORD"
set_password "app_auditor" "APP_AUDITOR_PASSWORD"
