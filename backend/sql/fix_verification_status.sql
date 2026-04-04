UPDATE users SET verification_status = 'PENDING' WHERE verification_status IS NULL;
