-- Upgrade script for chanzhiEPS 5.2.1.
-- Widen the password column so bcrypt hashes (60 characters) are stored intact.

ALTER TABLE `eps_user` MODIFY `password` varchar(255) NOT NULL DEFAULT '';
