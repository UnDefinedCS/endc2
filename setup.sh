#!/bin/bash

# collect needed config information
read -rs -p "Enter Admin Passphrase: " password
read -r -p "Enter Location to store sqlite file: " db_path

# save config to .env file
echo -e "DB_FILE_NAME='$db_path'\n" > .env
echo -e "ADM_PASSWD='$password'\n" >> .env

CN_=$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 10)

openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout server-key.pem \
  -out server-cert.pem \
  -days 365 \
  -subj "/C=US/ST=State/L=City/O=Dev/OU=Dev/CN=$CN_"

key_pem="$(pwd)/server-key.pem"
cert_pem="$(pwd)/server-cert.pem"

# build and run
npx drizzle-kit push && npm run dev
