#!/bin/sh

# Esegui update_jwk.sh all'avvio
/app/update_jwk.sh

# Avvia PostgREST
exec postgrest
