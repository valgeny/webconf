USE master;
GO
-- Create the new database if it does not exist already
IF NOT EXISTS (
    SELECT [name]
        FROM sys.databases
        WHERE [name] = N'TrueDigital'
)
CREATE DATABASE TrueDigital;
GO