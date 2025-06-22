-- Create KYC status enum type if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kyc_status') THEN
        CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'approved', 'rejected');
    END IF;
END$$;

-- Add id_proof_image column if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS id_proof_image TEXT;

-- Add kyc_rejection_reason column if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS kyc_rejection_reason TEXT;

-- Convert kyc_status from boolean to enum
-- First add a temporary column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS kyc_status_new kyc_status DEFAULT 'not_submitted';

-- Update the new column based on the old boolean value
UPDATE users
SET kyc_status_new = CASE
    WHEN kyc_status = true THEN 'approved'::kyc_status
    ELSE 'not_submitted'::kyc_status
END;

-- Drop the old column and rename the new one
ALTER TABLE users
DROP COLUMN IF EXISTS kyc_status;

ALTER TABLE users
RENAME COLUMN kyc_status_new TO kyc_status;

-- Set not null constraint
ALTER TABLE users
ALTER COLUMN kyc_status SET NOT NULL;

-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);