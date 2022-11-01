# Wait to be sure that SQL Server came up
echo "Waiting for initialization..."
sleep 50s
echo "Running init script..."
# Run the setup script to create the DB and the schema in the DB
# Note: make sure that your password matches what is in the Dockerfile
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "localDev1234!#" -d master -i create-database.sql
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "localDev1234!#" -d master -i create-schema.sql
echo "Done."