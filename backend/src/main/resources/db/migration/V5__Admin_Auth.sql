-- V5__Admin_Auth.sql

CREATE TABLE IF NOT EXISTS admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default admin account
-- email:    admin@studiovj.com
-- password: Admin@123  (CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN)
-- The hash below is a BCrypt hash of "Admin@123"
INSERT INTO admin_users (email, password, full_name)
VALUES (
    'admin@studiovj.com',
    '$2a$10$iVE.GtL.8JJSnvRIZZsefOc0DFJI9xuQu5SQSCJvx6QdglU2.WzCG',
    'Studio VJ Admin'
)
ON DUPLICATE KEY UPDATE email = email;
