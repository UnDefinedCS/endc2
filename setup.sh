#!/bin/bash

# collect needed config information
read -rs -p "Enter Admin Passphrase: " password
read -r -p "Enter Location to store sqlite file: " db_path

# save config to .env file
echo -e "DB_FILE_NAME='$db_path'\n" > .env
echo -e "ADM_PASSWD='$password'\n" >> .env

# build and run
npx drizzle-kit push && npm run build
