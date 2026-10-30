CREATE DATABASE IF NOT EXISTS interview_prep;
USE interview_prep;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  role VARCHAR(100) NOT NULL,
  difficulty ENUM('easy','medium','hard') DEFAULT 'medium',
  status ENUM('in_progress','completed') DEFAULT 'in_progress',
  overall_score FLOAT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_order INT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
  INDEX idx_session (session_id)
);

CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL UNIQUE,
  answer_text TEXT NOT NULL,
  score FLOAT DEFAULT NULL,
  feedback TEXT,
  strengths JSON,
  improvements JSON,
  keywords_matched JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);