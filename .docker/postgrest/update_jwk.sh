#!/bin/sh

# Fetch the public JWK
curl $JWK_URL > /app/jwk.pub

# Ask PostgREST to reload config
# Fails during Docker build because PostgREST isn't running yet
killall -SIGUSR2 postgrest || true