ALTER TABLE api.collaborations
ADD COLUMN company_paid_at TIMESTAMPTZ NULL,
ADD COLUMN payout_status TEXT NULL;