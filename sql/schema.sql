-- ============================================================
-- SkillSwap – Full Database Schema + Seed Data
-- MySQL 5.7+ / MariaDB 10.3+
-- ============================================================
-- Run this file once to set up the database:
--   mysql -u root < schema.sql
-- Or import via phpMyAdmin.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `skillswap_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `skillswap_db`;

-- ── Drop existing tables (in dependency order) ──────────────
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `credit_transactions`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `session_slots`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `user_profiles`;
DROP TABLE IF EXISTS `users`;


-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE `users` (
  `id`               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `name`             VARCHAR(100)    NOT NULL,
  `email`            VARCHAR(255)    NOT NULL,
  `password_hash`    VARCHAR(255)    NOT NULL,
  `role`             VARCHAR(100)    DEFAULT NULL          COMMENT 'e.g. Student, Senior Data Engineer',
  `company`          VARCHAR(150)    DEFAULT NULL          COMMENT 'e.g. ResMed Digital Health, SVU',
  `avatar_initial`   CHAR(1)         NOT NULL DEFAULT 'U',
  `avatar_color`     VARCHAR(7)      DEFAULT '#0d9488'     COMMENT 'Hex color for avatar circle',
  `credits`          INT UNSIGNED    NOT NULL DEFAULT 50,
  `profile_strength` TINYINT UNSIGNED NOT NULL DEFAULT 50  COMMENT 'Percentage 0–100',
  `profile_level`    VARCHAR(30)     NOT NULL DEFAULT 'Youngling',
  `sessions_taught`  INT UNSIGNED    NOT NULL DEFAULT 0,
  `sessions_booked`  INT UNSIGNED    NOT NULL DEFAULT 0,
  `attendance_rate`  TINYINT UNSIGNED DEFAULT NULL         COMMENT 'Percentage 0–100',
  `experience_years` TINYINT UNSIGNED DEFAULT NULL,
  `country_flag`     VARCHAR(10)     DEFAULT NULL          COMMENT 'Emoji flag e.g. 🇺🇸',
  `is_mentor`        TINYINT(1)      NOT NULL DEFAULT 0,
  `is_available_asap` TINYINT(1)     NOT NULL DEFAULT 0,
  `is_notable`       TINYINT(1)      NOT NULL DEFAULT 0,
  `is_new`           TINYINT(1)      NOT NULL DEFAULT 0,
  `categories`       VARCHAR(255)    DEFAULT NULL          COMMENT 'Space-separated: engineering product ai design',
  `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_email` (`email`)
) ENGINE=InnoDB;


-- ============================================================
-- 2. USER PROFILES  (editable about / experience / education)
-- ============================================================
CREATE TABLE `user_profiles` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED NOT NULL,
  `about`       TEXT         DEFAULT NULL,
  `experience`  JSON         DEFAULT NULL  COMMENT '[{role, company, period}, ...]',
  `education`   JSON         DEFAULT NULL  COMMENT '[{degree, school, period}, ...]',
  `skills`      JSON         DEFAULT NULL  COMMENT '["Python","Guitar", ...]',
  `languages`   JSON         DEFAULT NULL  COMMENT '["English","Hindi", ...]',
  `open_to_learn` JSON       DEFAULT NULL  COMMENT '["Cooking","Yoga", ...]',
  `linkedin_url`  VARCHAR(255) DEFAULT NULL,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 3. SESSIONS  (teaching sessions published by mentors)
-- ============================================================
CREATE TABLE `sessions` (
  `id`                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `mentor_id`           INT UNSIGNED    NOT NULL,
  `title`               VARCHAR(200)    NOT NULL,
  `skill`               VARCHAR(100)    NOT NULL,
  `description`         TEXT            DEFAULT NULL,
  `session_type`        ENUM('1on1','group') NOT NULL DEFAULT '1on1',
  `duration_minutes`    SMALLINT UNSIGNED NOT NULL DEFAULT 60,
  `credits_per_session` TINYINT UNSIGNED NOT NULL DEFAULT 10,
  `is_active`           TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mentor` (`mentor_id`),
  CONSTRAINT `fk_session_mentor` FOREIGN KEY (`mentor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 4. SESSION SLOTS  (available time slots per session)
-- ============================================================
CREATE TABLE `session_slots` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `session_id`  INT UNSIGNED    NOT NULL,
  `day_of_week` TINYINT UNSIGNED NOT NULL COMMENT '0=Sun, 1=Mon, ..., 6=Sat',
  `time_slot`   VARCHAR(10)     NOT NULL COMMENT 'e.g. 9:30 PM',
  `is_booked`   TINYINT(1)      NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_session` (`session_id`),
  CONSTRAINT `fk_slot_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 5. BOOKINGS
-- ============================================================
CREATE TABLE `bookings` (
  `id`           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `session_id`   INT UNSIGNED    NOT NULL,
  `learner_id`   INT UNSIGNED    NOT NULL,
  `slot_id`      INT UNSIGNED    DEFAULT NULL,
  `booking_date` DATE            NOT NULL,
  `time_slot`    VARCHAR(10)     NOT NULL COMMENT 'e.g. 9:30 PM',
  `status`       ENUM('upcoming','completed','cancelled') NOT NULL DEFAULT 'upcoming',
  `credits_paid` TINYINT UNSIGNED NOT NULL DEFAULT 10,
  `created_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_learner` (`learner_id`),
  KEY `idx_session` (`session_id`),
  CONSTRAINT `fk_booking_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_learner` FOREIGN KEY (`learner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 6. MESSAGES
-- ============================================================
CREATE TABLE `messages` (
  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender_id`   INT UNSIGNED NOT NULL,
  `receiver_id` INT UNSIGNED NOT NULL,
  `content`     TEXT         NOT NULL,
  `is_read`     TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sender`   (`sender_id`),
  KEY `idx_receiver` (`receiver_id`),
  KEY `idx_conversation` (`sender_id`, `receiver_id`, `created_at`),
  CONSTRAINT `fk_msg_sender`   FOREIGN KEY (`sender_id`)   REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 7. CREDIT TRANSACTIONS  (audit log)
-- ============================================================
CREATE TABLE `credit_transactions` (
  `id`          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED    NOT NULL,
  `amount`      SMALLINT        NOT NULL COMMENT 'Positive = earned, negative = spent',
  `type`        ENUM('earn','spend') NOT NULL,
  `description` VARCHAR(255)    NOT NULL,
  `reference_id` INT UNSIGNED   DEFAULT NULL COMMENT 'Optional FK to booking/session',
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `fk_credit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 8. REVIEWS  (session ratings by learners)
-- ============================================================
CREATE TABLE `reviews` (
  `id`          INT(11)         NOT NULL AUTO_INCREMENT,
  `booking_id`  INT(11)         DEFAULT NULL,
  `reviewer_id` INT(11)         NOT NULL,
  `mentor_id`   INT(11)         NOT NULL,
  `session_id`  INT(11)         NOT NULL,
  `rating`      TINYINT(4)      NOT NULL COMMENT '1–5',
  `review_text` TEXT            DEFAULT NULL,
  `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_mentor` (`mentor_id`),
  KEY `idx_session` (`session_id`)
) ENGINE=InnoDB;


-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TABLE `notifications` (
  `id`         INT(11)         NOT NULL AUTO_INCREMENT,
  `user_id`    INT(11)         NOT NULL,
  `type`       VARCHAR(50)     NOT NULL,
  `message`    TEXT            NOT NULL,
  `link`       VARCHAR(255)    DEFAULT NULL,
  `is_read`    TINYINT(1)      DEFAULT 0,
  `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB;


-- ============================================================
-- ██  SEED DATA  ██
-- ============================================================

-- ── Default user (the logged-in learner) ────────────────────
-- Password: "password123" → hashed with PASSWORD_BCRYPT
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `is_mentor`, `categories`) VALUES
(1, 'Rayan Castelino', 'rayan@skillswap.io',
  '$2y$10$/2DjR51MyWEh2XK/N8q0HOZ0ZaLn6vce.RzbHLUASp5dP3citzvai',
  'Student', 'SVU', 'R', '#f97316', 50, 50, 'Youngling', 0, NULL);

INSERT INTO `user_profiles` (`user_id`, `about`, `experience`, `education`, `skills`, `open_to_learn`) VALUES
(1, 'Currently a student, interested in engineering and passionate about hobbies like guitar.',
  '[]', '[]', '["Guitar","Engineering"]', '["Data Engineering","AI"]');


-- ── Mentor 1: Ronakkumar Bathani ────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `experience_years`, `country_flag`,
  `is_mentor`, `is_available_asap`, `categories`) VALUES
(2, 'Ronakkumar Bathani', 'ronakkumar@skillswap.io',
  '$2y$10$/2DjR51MyWEh2XK/N8q0HOZ0ZaLn6vce.RzbHLUASp5dP3citzvai',
  'Senior Data Engineer', 'ResMed Digital Health', 'R', '#0d4f47', 500, 90, 'Master',
  150, 96, 16, '🇺🇸', 1, 1, 'engineering');

INSERT INTO `user_profiles` (`user_id`, `about`, `experience`, `education`, `skills`, `languages`, `open_to_learn`) VALUES
(2, 'Ronakkumar Bathani is a highly experienced Data Engineer with over 16 years in IT, specialising in Data Warehousing and Business Intelligence across healthcare, telecommunication and financial services sectors. He has deep expertise in building scalable data pipelines, cloud-based data warehousing on AWS and Azure, and mentoring junior engineers. He is passionate about sharing practical, real-world knowledge that goes beyond textbooks.',
  '[{"role":"Senior Data Engineer","company":"ResMed Digital Health","period":"2020 – Present"},{"role":"Data Architect","company":"Telstra","period":"2015 – 2020"}]',
  '[{"degree":"M.S. Computer Science","school":"University of Mumbai","period":"2006 – 2008"}]',
  '["Data Product Management","Data Engineering","Data Warehousing"]',
  '["English"]',
  '["Cooking","Guitar","Yoga"]');


-- ── Mentor 2: Suresh Patel ──────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `experience_years`,
  `is_mentor`, `is_available_asap`, `categories`) VALUES
(3, 'Suresh Patel', 'suresh@skillswap.io',
  '$2y$10$/2DjR51MyWEh2XK/N8q0HOZ0ZaLn6vce.RzbHLUASp5dP3citzvai',
  'Enterprise Architect', 'NTT', 'S', '#1e3a5f', 400, 85, 'Expert',
  80, 93, 25, 1, 1, 'product');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(3, 'Enterprise Architect with 25 years of experience in IT strategy, system design, and digital transformation across telecom and financial services.',
  '["Enterprise Architecture","System Design","Cloud Strategy"]', '["English","Hindi"]');


-- ── Mentor 3: Alex M. ───────────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `country_flag`,
  `is_mentor`, `is_new`, `categories`) VALUES
(4, 'Alex M.', 'alex@skillswap.io',
  '$2y$10$/2DjR51MyWEh2XK/N8q0HOZ0ZaLn6vce.RzbHLUASp5dP3citzvai',
  'Front-end Tech Lead', 'Codete', 'A', '#1c1c1c', 50, 60, 'Beginner',
  0, '🇵🇱', 1, 1, 'engineering');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(4, 'Front-end Tech Lead specialising in React, TypeScript, and modern web architectures. Passionate about clean code and developer experience.',
  '["React","TypeScript","CSS Architecture"]', '["English","Polish"]');


-- ── Mentor 4: James K. ──────────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `experience_years`, `country_flag`,
  `is_mentor`, `is_notable`, `categories`) VALUES
(5, 'James K.', 'james@skillswap.io',
  '$2y$10$/2DjR51MyWEh2XK/N8q0HOZ0ZaLn6vce.RzbHLUASp5dP3citzvai',
  'Product Designer', NULL, 'J', '#2d1b69', 200, 80, 'Advanced',
  22, 88, 7, '🇬🇧', 1, 1, 'design');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(5, 'Product Designer with 7 years of experience in UX/UI, design systems, and user research. Previously at Spotify and Figma.',
  '["UX Design","UI Design","Design Systems","Figma"]', '["English"]');


-- ── Mentor 5: Priya Singh ───────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `experience_years`, `country_flag`,
  `is_mentor`, `is_notable`, `categories`) VALUES
(6, 'Priya Singh', 'priya@skillswap.io',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'AI Research Lead', 'Google', 'P', '#14532d', 350, 90, 'Master',
  48, 97, 10, '🇮🇳', 1, 1, 'ai');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(6, 'AI Research Lead at Google, working on large language models and applied machine learning. Published 12 papers in NeurIPS and ICML.',
  '["Machine Learning","Deep Learning","NLP","Python"]', '["English","Hindi"]');


-- ── Mentor 6: Marco R. ──────────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `experience_years`, `country_flag`,
  `is_mentor`, `is_available_asap`, `categories`) VALUES
(7, 'Marco R.', 'marco@skillswap.io',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'CTO', 'TechStartup', 'M', '#7c2d12', 300, 85, 'Expert',
  35, 91, 12, '🇮🇹', 1, 1, 'product engineering');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(7, 'CTO and co-founder of a fast-growing B2B SaaS startup. 12 years building and scaling engineering teams from 3 to 60+ people.',
  '["Technical Leadership","System Architecture","Startup Strategy"]', '["English","Italian"]');


-- ── Mentor 7: Sara L. ───────────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `country_flag`,
  `is_mentor`, `categories`) VALUES
(8, 'Sara L.', 'sara@skillswap.io',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Head of Growth', 'Notion', 'S', '#831843', 280, 85, 'Expert',
  32, 95, '🇺🇸', 1, 'marketing soft');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(8, 'Head of Growth at Notion. Specialises in PLG strategies, content marketing, and building growth loops for SaaS products.',
  '["Growth Strategy","Content Marketing","PLG","Analytics"]', '["English","Spanish"]');


-- ── Mentor 8: David K. ──────────────────────────────────────
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `company`,
  `avatar_initial`, `avatar_color`, `credits`, `profile_strength`, `profile_level`,
  `sessions_taught`, `attendance_rate`, `country_flag`,
  `is_mentor`, `is_new`, `categories`) VALUES
(9, 'David K.', 'david@skillswap.io',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Executive Coach', NULL, 'D', '#164e63', 100, 70, 'Intermediate',
  5, 100, '🇩🇪', 1, 1, 'soft');

INSERT INTO `user_profiles` (`user_id`, `about`, `skills`, `languages`) VALUES
(9, 'Executive Coach helping tech leaders build presence, negotiate effectively, and transition into senior leadership roles.',
  '["Executive Coaching","Negotiation","Leadership","Communication"]', '["English","German"]');


-- ── Sessions for each mentor ────────────────────────────────

-- Ronakkumar's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(1, 2, 'Data Engineering Fundamentals', 'Data Engineering',
  'Learn the fundamentals of data pipelines, ETL processes, and cloud-based data warehousing. Perfect for beginners looking to break into the data engineering field.', 10);

-- Suresh's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(2, 3, 'Enterprise Architecture Deep Dive', 'System Design',
  'Understand how to design large-scale enterprise systems, choose the right architecture patterns, and navigate digital transformation initiatives.', 10);

-- Alex's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(3, 4, 'Modern React Patterns', 'React',
  'Master advanced React patterns including hooks composition, state machines, and server components. Hands-on code review included.', 10);

-- James's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(4, 5, 'Design Systems from Scratch', 'UX Design',
  'Build a production-grade design system step by step. Covers tokens, component API design, and Figma-to-code workflows.', 10);

-- Priya's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(5, 6, 'Intro to Machine Learning', 'Machine Learning',
  'A practical introduction to ML: supervised learning, model evaluation, and deploying your first model to production.', 10);

-- Marco's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(6, 7, 'Scaling Engineering Teams', 'Technical Leadership',
  'How to grow an engineering team from 3 to 60+. Covers hiring, culture, technical debt management, and org design.', 10);

-- Sara's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(7, 8, 'Growth Strategy for SaaS', 'Growth Strategy',
  'Learn PLG fundamentals, growth loops, and content-led acquisition strategies that work for B2B SaaS products.', 10);

-- David's session
INSERT INTO `sessions` (`id`, `mentor_id`, `title`, `skill`, `description`, `credits_per_session`) VALUES
(8, 9, 'Executive Presence Workshop', 'Leadership',
  'Build your executive presence: effective communication in meetings, stakeholder management, and personal branding.', 10);


-- ── Time slots for Ronakkumar (session 1) ───────────────────
-- Matching the times shown in mentor.html
INSERT INTO `session_slots` (`session_id`, `day_of_week`, `time_slot`) VALUES
(1, 1, '9:30 PM'),  (1, 1, '9:45 PM'),  (1, 1, '10:00 PM'),
(1, 1, '10:15 PM'), (1, 1, '10:30 PM'), (1, 1, '10:45 PM'),
(1, 2, '9:00 AM'),  (1, 2, '10:00 AM'), (1, 2, '2:00 PM'),
(1, 2, '9:30 PM'),  (1, 2, '10:00 PM'),
(1, 3, '9:00 AM'),  (1, 3, '11:00 AM'), (1, 3, '3:00 PM'),
(1, 3, '9:30 PM'),  (1, 3, '10:30 PM'),
(1, 4, '10:00 AM'), (1, 4, '1:00 PM'),  (1, 4, '4:00 PM'),
(1, 4, '9:45 PM'),  (1, 4, '10:15 PM'),
(1, 5, '9:00 AM'),  (1, 5, '11:00 AM'), (1, 5, '2:00 PM'),
(1, 5, '9:30 PM'),  (1, 5, '10:00 PM');

-- ── Generic slots for other mentors (sessions 2–8) ─────────
INSERT INTO `session_slots` (`session_id`, `day_of_week`, `time_slot`) VALUES
(2, 1, '8:00 AM'), (2, 1, '10:00 AM'), (2, 1, '2:00 PM'), (2, 2, '9:00 AM'), (2, 2, '3:00 PM'),
(3, 1, '9:00 AM'), (3, 1, '11:00 AM'), (3, 1, '4:00 PM'), (3, 3, '10:00 AM'), (3, 3, '5:00 PM'),
(4, 2, '10:00 AM'), (4, 2, '1:00 PM'), (4, 2, '6:00 PM'), (4, 4, '9:00 AM'), (4, 4, '2:00 PM'),
(5, 1, '9:00 AM'), (5, 1, '12:00 PM'), (5, 3, '10:00 AM'), (5, 3, '3:00 PM'), (5, 5, '11:00 AM'),
(6, 2, '8:00 AM'), (6, 2, '11:00 AM'), (6, 4, '9:00 AM'), (6, 4, '4:00 PM'), (6, 5, '2:00 PM'),
(7, 1, '10:00 AM'), (7, 1, '3:00 PM'), (7, 3, '9:00 AM'), (7, 3, '1:00 PM'), (7, 5, '10:00 AM'),
(8, 2, '9:00 AM'), (8, 2, '2:00 PM'), (8, 4, '10:00 AM'), (8, 4, '3:00 PM'), (8, 5, '11:00 AM');


-- ── Initial credit transaction for Rayan (signup bonus) ─────
INSERT INTO `credit_transactions` (`user_id`, `amount`, `type`, `description`) VALUES
(1, 50, 'earn', 'Welcome bonus – new account signup');


-- ── Sample review message from Ananya (matching mentor.html) ─
-- We create a dummy user for the reviewer
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`,
  `avatar_initial`, `avatar_color`, `is_mentor`) VALUES
(10, 'Ananya S.', 'ananya@skillswap.io',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Student', 'A', '#0d9488', 0);

INSERT INTO `user_profiles` (`user_id`, `about`) VALUES
(10, 'Computer Science student interested in data engineering.');


-- ============================================================
-- Done! Schema and seed data loaded successfully.
-- ============================================================
