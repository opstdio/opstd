FROM postgres:17-bullseye
LABEL authors="frnwtr"

ENV DEBIAN_FRONTEND=noninteractive
USER root
# Installazione dei pacchetti
RUN apt-get update && apt-get upgrade -y && \
	apt-get install -y --no-install-recommends \
  curl \
  wget \
  ca-certificates \
  postgresql-contrib \
	postgresql-17-postgis-3 \
  postgresql-17-postgis-3-scripts \
	postgresql-17-pgvector \
	postgresql-17-age \
	postgresql-17-pgaudit \
	postgresql-17-partman \
	postgresql-17-http \
	postgresql-17-wal2json \
	postgresql-17-tablelog \
	postgresql-17-set-user \
	postgresql-17-semver \
	postgresql-17-repack \
	postgresql-17-preprepare \
	postgresql-17-pgtt \
	postgresql-17-pgtap \
	postgresql-17-pgrouting \
	postgresql-17-pgq3 \
	postgresql-17-pgpcre \
	postgresql-17-pg-hint-plan \
	postgresql-17-periods \
	postgresql-17-mobilitydb \
	postgresql-17-hypopg \
	postgresql-17-first-last-agg \
	postgresql-17-cron && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/* && \
  ldconfig

# Crea la directory per gli script di inizializzazione
RUN mkdir -p /docker-entrypoint-initdb.d

# Crea lo script di inizializzazione delle estensioni
COPY ./scripts/ /docker-entrypoint-initdb.d/

COPY postgres.conf /etc/postgresql/postgresql.conf




USER postgres
CMD ["postgres","-c","config_file=/etc/postgresql/postgresql.conf"]