FROM postgres:17-bullseye AS curl_builder

ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get remove -y --purge 'libcurl*' || true && \
    apt-get autoremove -y && \
    apt-get purge -y libcurl4 libcurl3 || true && \
    apt-get clean


RUN apt-get update && apt-get install -y --no-install-recommends \
	 build-essential \
	 pkg-config \
	 libssl-dev \
	 libnghttp2-dev \
	 zlib1g-dev \
	 openssl \
	 wget \
	 git \
	 gcc \
	 make \
	 ca-certificates \
	 libpsl-dev \
	 libidn2-dev

# Scarica e compila curl 8.12.1
WORKDIR /tmp/build
RUN wget https://curl.se/download/curl-8.12.1.tar.gz && \
	 tar -xzf curl-8.12.1.tar.gz

WORKDIR /tmp/build/curl-8.12.1
RUN ./configure \
    --prefix=/usr/local \
    --libdir=/usr/local/lib \
    --with-ssl \
    --with-nghttp2 \
    --enable-shared \
    --disable-static \
    --with-libpsl \
    --with-libidn2 \
    --disable-ldap \
    && make -j$(nproc) \
    && make install \
    && ldconfig


# Verifica la versione di curl
RUN echo "/usr/local/lib" >> /etc/ld.so.conf.d/curl.conf \
    && ldconfig \
    && /usr/local/bin/curl --version


# Creare symlink per libcurl con versione esplicita
RUN cd /usr/local/lib \
	 && ln -sf libcurl.so.4.8.0 libcurl.so.4 \
	 && ln -sf libcurl.so.4 libcurl.so

FROM postgres:17-bullseye AS pg_net_builder

RUN apt-get update && \
	 apt-get remove -y --purge 'libcurl*' || true && \
	 apt-get autoremove -y && \
	 apt-get clean

ENV GIT_SSL_NO_VERIFY=1

COPY --from=curl_builder /usr/local/lib/libcurl.so* /usr/local/lib/
COPY --from=curl_builder /usr/local/include/curl /usr/local/include/curl

RUN apt-get update && apt-get install -y --no-install-recommends \
	 build-essential \
	 postgresql-server-dev-17 \
	 git \
	 ca-certificates \
	 wget

# Clonare e costruire pg_net
WORKDIR /tmp/build
RUN git clone --depth 1 --branch v0.14.0 https://github.com/supabase/pg_net.git

WORKDIR /tmp/build/pg_net
RUN export CURL_CFLAGS="-I/usr/local/include" \
	 && export CURL_LIBS="-L/usr/local/lib -lcurl" \
	 && export LIBRARY_PATH=/usr/local/lib \
	 && export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH \
	 && make \
	 && make install

FROM postgres:17-bullseye AS pgjwt_builder

RUN apt-get update && \
	 apt-get remove -y --purge 'libcurl*' || true && \
	 apt-get autoremove -y && \
	 apt-get clean

ENV GIT_SSL_NO_VERIFY=1

COPY --from=curl_builder /usr/local/lib/libcurl.so* /usr/local/lib/
COPY --from=curl_builder /usr/local/include/curl /usr/local/include/curl

RUN apt-get update && apt-get install -y --no-install-recommends \
	 build-essential \
	 postgresql-server-dev-17 \
	 git \
	 ca-certificates \
	 wget

# Clonare e costruire pgjwt
WORKDIR /tmp/build
RUN git clone --depth 1 https://github.com/michelp/pgjwt

WORKDIR /tmp/build/pgjwt
RUN export CURL_CFLAGS="-I/usr/local/include" \
	 && export CURL_LIBS="-L/usr/local/lib -lcurl" \
	 && export LIBRARY_PATH=/usr/local/lib \
	 && export LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH \
	 && make \
	 && make install

# Fase di preparazione
FROM postgres:17-bullseye AS wrappers_builder

# Definisci l'architettura
ARG TARGETARCH

RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    ca-certificates


# Scarica il pacchetto corretto in base all'architettura
RUN if [ "$TARGETARCH" = "amd64" ]; then \
        wget https://github.com/supabase/wrappers/releases/download/v0.4.5/wrappers-v0.4.5-pg17-amd64-linux-gnu.deb -O /tmp/wrappers.deb; \
    elif [ "$TARGETARCH" = "arm64" ]; then \
        wget https://github.com/supabase/wrappers/releases/download/v0.4.5/wrappers-v0.4.5-pg17-arm64-linux-gnu.deb -O /tmp/wrappers.deb; \
    else \
        echo "Unsupported architecture" && exit 1; \
    fi

FROM postgres:17-bullseye
LABEL authors="frnwtr"

ENV DEBIAN_FRONTEND=noninteractive
USER root
RUN apt-get update && \
    apt-get remove -y --purge 'libcurl*' || true && \
    apt-get autoremove -y && \
    apt-get purge -y libcurl4 libcurl3 || true && \
    apt-get clean

# Installazione dei pacchetti
RUN apt-get update && apt-get upgrade -y && \
	 apt-get install -y --no-install-recommends \
	 tzdata \
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
	 postgresql-17-cron \
	 libssl1.1 \
	 libnghttp2-14 && \
	 apt-get clean && \
	 rm -rf /var/lib/apt/lists/* && \
	 ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && \
	 dpkg-reconfigure --frontend noninteractive tzdata && \
	 ldconfig

# Copia curl e librerie personalizzate
COPY --from=curl_builder /usr/local/bin/curl /usr/local/bin/curl
COPY --from=curl_builder /usr/local/lib/libcurl.so* /usr/local/lib/
COPY --from=pg_net_builder /usr/lib/postgresql/17/lib/pg_net.so /usr/lib/postgresql/17/lib/
COPY --from=pg_net_builder /usr/share/postgresql/17/extension/pg_net* /usr/share/postgresql/17/extension/
COPY --from=pgjwt_builder /usr/share/postgresql/17/extension/pgjwt* /usr/share/postgresql/17/extension/


COPY --from=wrappers_builder /tmp/wrappers.deb /tmp/wrappers.deb
RUN dpkg -i /tmp/wrappers.deb || apt-get -f install -y

# Configurazione librerie curl
RUN \
	 # Rimuovi vecchi symlink e file
	 rm -f /usr/lib/aarch64-linux-gnu/libcurl.so* \
	 # Copia librerie personalizzate
	 && cp /usr/local/lib/libcurl.so.4 /usr/lib/aarch64-linux-gnu/libcurl.so.4 \
	 && cp /usr/local/lib/libcurl.so /usr/lib/aarch64-linux-gnu/libcurl.so \
	 # Aggiorna configurazione librerie
	 && echo "/usr/local/lib" > /etc/ld.so.conf.d/local-curl.conf \
	 && ldconfig \
	 # Imposta alternative per curl
	 && update-alternatives --install /usr/bin/curl curl /usr/local/bin/curl 100 \
	 && update-alternatives --set curl /usr/local/bin/curl

# Log di debug
RUN ldd /usr/lib/postgresql/17/lib/pg_net.so

# Crea la directory per gli script di inizializzazione
RUN mkdir -p /docker-entrypoint-initdb.d

# Crea lo script di inizializzazione delle estensioni
COPY ./scripts/ /docker-entrypoint-initdb.d/

COPY postgres.conf /etc/postgresql/postgresql.conf
HEALTHCHECK --interval=2s --timeout=2s --retries=10 CMD pg_isready -U postgres -h localhost
STOPSIGNAL SIGINT

USER postgres
CMD ["postgres","-c","config_file=/etc/postgresql/postgresql.conf"]