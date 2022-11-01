# WEB CONFERENCE SYSTEM

## Setup (Docker)

```
docker-compose up
```

Note: The app will error out and restart for about 1 minute until the DB initialization is completed


## Setup (Local)

### NODE/NVM

### NodeJs
If this is your first time installing node, use NVM to manage your node version:
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

Once NVM is installed, grab the correct version:

```
nvm install --lts
```

### NPM
```
npm install npm@latest
```

### Application
- NodeJs: https://www.pluralsight.com/guides/getting-started-with-nodejs
- Run the following commands
```
npm install
```

### Database Microsoft SQL

1) Download Docker image

```
sudo npm install -g sql-cli
sudo npm install -g ts-node
sudo npm install -g typeorm

sudo docker pull mcr.microsoft.com/mssql/server:2019-latest
docker run -d --name sql_server_demo -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=localDev1234!#' -p 1433:1433 mcr.microsoft.com/mssql/server:2019-latest
```

See also: https://database.guide/how-to-install-sql-server-on-a-mac/


2) Create Database
```
-- Create a new database called 'DatabaseName'
-- Connect to the 'master' database to run this snippet
USE master
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
    SELECT [name]
        FROM sys.databases
        WHERE [name] = N'TrueDigital'
)
CREATE DATABASE TrueDigital
GO
```

3) Create Schema
```
Create SCHEMA webconference
```

## Start the App
```
npm run start
```

## API

1) Download Postman: https://www.postman.com/

2) Import provided Collection