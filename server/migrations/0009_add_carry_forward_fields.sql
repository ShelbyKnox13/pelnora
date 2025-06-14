-- Add carry forward fields for binary income calculation
ALTER TABLE users 
ADD COLUMN left_carry_forward NUMERIC DEFAULT 0 NOT NULL,
ADD COLUMN right_carry_forward NUMERIC DEFAULT 0 NOT NULL;

-- Update existing users to have 0 carry forward
UPDATE users SET left_carry_forward = 0, right_carry_forward = 0 WHERE left_carry_forward IS NULL OR right_carry_forward IS NULL;