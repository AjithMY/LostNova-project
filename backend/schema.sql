-- LostNova Database Schema
-- Run: mysql -u root -p lostnova < schema.sql

CREATE DATABASE IF NOT EXISTS lostnova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lostnova;

-- ──────────────────── USERS ────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('student','staff','admin') NOT NULL DEFAULT 'student',
  avatar_url    VARCHAR(500),
  is_verified   BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB;

-- ──────────────────── LOST ITEMS ────────────────────
CREATE TABLE IF NOT EXISTS lost_items (
  id            INT          NOT NULL AUTO_INCREMENT,
  user_id       INT          NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  category      VARCHAR(80),
  location_lost VARCHAR(200),
  date_lost     DATE,
  image_url     VARCHAR(500),
  status        ENUM('open','matched','recovered') NOT NULL DEFAULT 'open',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status   (status),
  INDEX idx_user_id  (user_id),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_lost (title, description)
) ENGINE=InnoDB;

-- ──────────────────── FOUND ITEMS ────────────────────
CREATE TABLE IF NOT EXISTS found_items (
  id             INT          NOT NULL AUTO_INCREMENT,
  user_id        INT          NOT NULL,
  title          VARCHAR(200) NOT NULL,
  description    TEXT,
  category       VARCHAR(80),
  location_found VARCHAR(200),
  date_found     DATE,
  image_url      VARCHAR(500),
  status         ENUM('open','matched','claimed') NOT NULL DEFAULT 'open',
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status   (status),
  INDEX idx_user_id  (user_id),
  INDEX idx_category (category),
  FULLTEXT INDEX ft_found (title, description)
) ENGINE=InnoDB;

-- ──────────────────── MATCHES ────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id             INT            NOT NULL AUTO_INCREMENT,
  lost_item_id   INT            NOT NULL,
  found_item_id  INT            NOT NULL,
  score          DECIMAL(5,2)   NOT NULL DEFAULT 0,
  ai_explanation TEXT,
  status         ENUM('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
  matched_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (lost_item_id)  REFERENCES lost_items(id)  ON DELETE CASCADE,
  FOREIGN KEY (found_item_id) REFERENCES found_items(id) ON DELETE CASCADE,
  UNIQUE KEY uq_match (lost_item_id, found_item_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ──────────────────── CLAIMS ────────────────────
CREATE TABLE IF NOT EXISTS claims (
  id           INT  NOT NULL AUTO_INCREMENT,
  match_id     INT  NOT NULL,
  claimant_id  INT  NOT NULL,
  proof_url    VARCHAR(500),
  message      TEXT,
  status       ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewed_by  INT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (match_id)    REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (claimant_id) REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)   ON DELETE SET NULL,
  UNIQUE KEY uq_claim_per_user (match_id, claimant_id),
  INDEX idx_status (status),
  INDEX idx_claimant (claimant_id)
) ENGINE=InnoDB;

-- ──────────────────── NOTIFICATIONS ────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         INT          NOT NULL AUTO_INCREMENT,
  user_id    INT          NOT NULL,
  type       VARCHAR(50)  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ──────────────────── ACTIVITY LOGS ────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT,
  action      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id   INT,
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action  (action)
) ENGINE=InnoDB;

-- ──────────────────── SEED: Admin user ────────────────────
-- Password: Admin@1234 (bcrypt hash)
INSERT IGNORE INTO users (name, email, password_hash, role, is_verified)
VALUES ('Admin', 'admin@lostnova.ai', '$2b$12$HsZTkiYx3LxWeogaFiFjcuC7OmOf.kZOj.BNWHI7tNbyr5cVCECya', 'admin', TRUE);
-- Login: admin@lostnova.ai / Admin@1234
