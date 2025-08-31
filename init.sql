-- init.sql
-- Create the application user
CREATE USER 'AdminUser'@'%' IDENTIFIED BY 'AdminUser';

-- Grant privileges to the application user on your application database
GRANT ALL PRIVILEGES ON school_db.* TO 'AdminUser'@'%';

-- Grant necessary system privileges for Prisma
GRANT CREATE, ALTER, DROP, REFERENCES, INDEX, SELECT, INSERT, UPDATE, DELETE ON `school_db`.* TO `AdminUser`@`%`;
GRANT SELECT ON `mysql`.* TO `AdminUser`@`%`;
GRANT SELECT ON `performance_schema`.* TO `AdminUser`@`%`;
GRANT SELECT ON `information_schema`.* TO `AdminUser`@`%`;

FLUSH PRIVILEGES;