
CREATE DATABASE IF NOT EXISTS school_db;
-- Create the application user
CREATE USER 'AdminUser'@'%' IDENTIFIED BY 'AdminUser';

-- Grant privileges to the application user on your application database
GRANT ALL PRIVILEGES ON school_db.* TO 'AdminUser'@'%';

-- Prisma needs read-only on information_schema & performance_schema
GRANT SELECT ON `performance_schema`.* TO `AdminUser`@`%`;
GRANT SELECT ON `information_schema`.* TO `AdminUser`@`%`;

FLUSH PRIVILEGES;
