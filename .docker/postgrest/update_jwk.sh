#!/bin/sh

# Fetch the public JWK
curl http://auth:4001/api/auth/jwks > /app/jwk.pub

# Ask PostgREST to reload config
# Fails during Docker build because PostgREST isn't running yet
killall -SIGUSR2 postgrest || true