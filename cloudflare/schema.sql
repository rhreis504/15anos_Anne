-- Anne XV / Cloudflare D1
-- Execute no painel D1 > Console APENAS no banco novo da Cloudflare.
-- Nao altera os arquivos do Google Drive ou o Apps Script original.
CREATE TABLE IF NOT EXISTS guests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 50),
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  guest_id TEXT NOT NULL REFERENCES guests(id),
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_media_recent ON media(hidden,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_guest ON media(guest_id);
CREATE TABLE IF NOT EXISTS votes (
  guest_id TEXT NOT NULL REFERENCES guests(id),
  media_id TEXT NOT NULL REFERENCES media(id),
  created_at INTEGER NOT NULL,
  PRIMARY KEY(guest_id,media_id)
);
CREATE TRIGGER IF NOT EXISTS media_like_added
AFTER INSERT ON votes
BEGIN
  UPDATE media SET likes=likes+1 WHERE id=NEW.media_id;
END;
CREATE TRIGGER IF NOT EXISTS media_like_removed
AFTER DELETE ON votes
BEGIN
  UPDATE media SET likes=MAX(0,likes-1) WHERE id=OLD.media_id;
END;
