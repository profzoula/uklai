-- Track when a post-delivery review request email was sent
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS review_request_sent_at TIMESTAMPTZ;
