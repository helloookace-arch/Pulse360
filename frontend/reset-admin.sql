-- Pulse360 Admin Password Reset
-- Run with: npx wrangler d1 execute pulse360-db --remote --file=./reset-admin.sql
-- Password: Admin@Pulse360

INSERT OR REPLACE INTO User (id, username, email, passwordHash, salt, role) VALUES
('user_admin_pulse360', 'admin', 'admin@pulse360.rw', '81ae06d2cdc39e0fd9be3d670ad506832acea58c50f55255713dee3f30feacfd', '8f2e5976919df833b7c397af46aae2a2', 'admin');
