FROM postgrest/postgrest

USER root

RUN apt-get update && apt install -y curl cron psmisc -y --no-install-recommends && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the cron job script
COPY update_jwk.sh /app/update_jwk.sh
RUN chmod +x /app/update_jwk.sh

# Copy the crontab file
COPY crontab /etc/cron.d/update_jwk
RUN chmod 0644 /etc/cron.d/update_jwk

# Apply the cron job
RUN crontab /etc/cron.d/update_jwk

# Get the current JWK
RUN ./app/update_jwk.sh