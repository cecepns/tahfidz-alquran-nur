-- Database: tahfidz_nur
-- Yayasan Tahfidz Alquran Nur Management System

CREATE DATABASE IF NOT EXISTS `tahfidz_nur` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tahfidz_nur`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(100) NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'guru', 'santri', 'orang_tua') NOT NULL DEFAULT 'santri',
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `avatar_url` VARCHAR(255) NULL,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS `teachers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `nip` VARCHAR(50) NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `gender` ENUM('L', 'P') NOT NULL DEFAULT 'L',
  `phone` VARCHAR(30) NULL,
  `email` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `photo` VARCHAR(255) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_teachers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PARENTS TABLE
CREATE TABLE IF NOT EXISTS `parents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `full_name` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(100) NULL,
  `address` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_parents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL UNIQUE,
  `parent_id` INT NULL,
  `nis` VARCHAR(50) NOT NULL UNIQUE,
  `nik` VARCHAR(30) NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `gender` ENUM('L', 'P') NOT NULL DEFAULT 'L',
  `birth_place` VARCHAR(80) NULL,
  `birth_date` DATE NULL,
  `address` TEXT NULL,
  `phone` VARCHAR(30) NULL,
  `parent_name` VARCHAR(120) NULL,
  `parent_phone` VARCHAR(30) NULL,
  `photo` VARCHAR(255) NULL,
  `join_date` DATE NOT NULL,
  `target_juz` VARCHAR(50) DEFAULT 'Juz 30',
  `status` ENUM('active', 'inactive', 'graduated') NOT NULL DEFAULT 'active',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_parent` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. GROUPS / KELAS TABLE
CREATE TABLE IF NOT EXISTS `groups` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `teacher_id` INT NULL,
  `description` TEXT NULL,
  `schedule_days` VARCHAR(100) NULL DEFAULT 'Senin - Jumat',
  `schedule_time` VARCHAR(100) NULL DEFAULT '16:00 - 17:30',
  `target_description` VARCHAR(255) NULL DEFAULT 'Target Juz 30 & 29',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_groups_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. GROUP MEMBERS TABLE
CREATE TABLE IF NOT EXISTS `group_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_group_student` (`group_id`, `student_id`),
  CONSTRAINT `fk_gm_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_gm_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. QURAN SURAHS TABLE (Full 114 Surahs)
CREATE TABLE IF NOT EXISTS `quran_surahs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `number` INT NOT NULL UNIQUE,
  `name_latin` VARCHAR(100) NOT NULL,
  `name_arabic` VARCHAR(100) NOT NULL,
  `total_ayahs` INT NOT NULL,
  `starting_juz` INT NOT NULL,
  `revelation_type` ENUM('Makkiyah', 'Madaniyah') NOT NULL DEFAULT 'Makkiyah'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. MEMORIZATION REPORTS (Hafalan Baru, Murojaah Harian, Murojaah Pekanan)
CREATE TABLE IF NOT EXISTS `memorization_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `group_id` INT NULL,
  `date` DATE NOT NULL,
  `type` ENUM('NEW_MEMORIZATION', 'DAILY_MUROJAAH', 'WEEKLY_MUROJAAH') NOT NULL DEFAULT 'NEW_MEMORIZATION',
  `surah_id` INT NULL,
  `surah_name` VARCHAR(100) NULL,
  `start_ayah` INT NOT NULL DEFAULT 1,
  `end_ayah` INT NOT NULL DEFAULT 1,
  `total_ayahs` INT NOT NULL DEFAULT 1,
  `juz_number` INT NULL,
  `score` ENUM('A', 'B', 'C') NOT NULL DEFAULT 'A',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mr_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mr_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_mr_surah` FOREIGN KEY (`surah_id`) REFERENCES `quran_surahs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MEMORIZATION TARGETS
CREATE TABLE IF NOT EXISTS `memorization_targets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `target_title` VARCHAR(150) NOT NULL,
  `target_juz` INT NULL,
  `target_surah_id` INT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('in_progress', 'completed', 'overdue') NOT NULL DEFAULT 'in_progress',
  `progress_percent` INT NOT NULL DEFAULT 0,
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mt_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `group_id` INT NULL,
  `teacher_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('hadir', 'izin', 'sakit', 'alpa') NOT NULL DEFAULT 'hadir',
  `notes` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_student_date` (`student_id`, `date`),
  CONSTRAINT `fk_att_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_att_group` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NULL,
  `user_name` VARCHAR(100) NULL,
  `user_role` VARCHAR(30) NULL,
  `action` VARCHAR(50) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `ip_address` VARCHAR(50) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'info',
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED 114 QURAN SURAHS
INSERT INTO `quran_surahs` (`number`, `name_latin`, `name_arabic`, `total_ayahs`, `starting_juz`, `revelation_type`) VALUES
(1, 'Al-Fatihah', 'الفاتحة', 7, 1, 'Makkiyah'),
(2, 'Al-Baqarah', 'البقرة', 286, 1, 'Madaniyah'),
(3, 'Ali ''Imran', 'آل عمران', 200, 3, 'Madaniyah'),
(4, 'An-Nisa''', 'النساء', 176, 4, 'Madaniyah'),
(5, 'Al-Ma''idah', 'المائدة', 120, 6, 'Madaniyah'),
(6, 'Al-An''am', 'الأنعام', 165, 7, 'Makkiyah'),
(7, 'Al-A''raf', 'الأعراف', 206, 8, 'Makkiyah'),
(8, 'Al-Anfal', 'الأنفال', 75, 9, 'Madaniyah'),
(9, 'At-Taubah', 'التوبة', 129, 10, 'Madaniyah'),
(10, 'Yunus', 'يونس', 109, 11, 'Makkiyah'),
(11, 'Hud', 'هود', 123, 11, 'Makkiyah'),
(12, 'Yusuf', 'يوسف', 111, 12, 'Makkiyah'),
(13, 'Ar-Ra''d', 'الرعد', 43, 13, 'Madaniyah'),
(14, 'Ibrahim', 'إبراهيم', 52, 13, 'Makkiyah'),
(15, 'Al-Hijr', 'الحجر', 99, 14, 'Makkiyah'),
(16, 'An-Nahl', 'النحل', 128, 14, 'Makkiyah'),
(17, 'Al-Isra''', 'الإسراء', 111, 15, 'Makkiyah'),
(18, 'Al-Kahf', 'الكهف', 110, 15, 'Makkiyah'),
(19, 'Maryam', 'مريم', 98, 16, 'Makkiyah'),
(20, 'Taha', 'طه', 135, 16, 'Makkiyah'),
(21, 'Al-Anbiya''', 'الأنبياء', 112, 17, 'Makkiyah'),
(22, 'Al-Hajj', 'الحج', 78, 17, 'Madaniyah'),
(23, 'Al-Mu''minun', 'المؤمنون', 118, 18, 'Makkiyah'),
(24, 'An-Nur', 'النور', 64, 18, 'Madaniyah'),
(25, 'Al-Furqan', 'الفرقان', 77, 18, 'Makkiyah'),
(26, 'Asy-Syu''ara''', 'الشعراء', 227, 19, 'Makkiyah'),
(27, 'An-Naml', 'النمل', 93, 19, 'Makkiyah'),
(28, 'Al-Qasas', 'القصص', 88, 20, 'Makkiyah'),
(29, 'Al-''Ankabut', 'العنكبوت', 69, 20, 'Makkiyah'),
(30, 'Ar-Rum', 'الروم', 60, 21, 'Makkiyah'),
(31, 'Luqman', 'لقمان', 34, 21, 'Makkiyah'),
(32, 'As-Sajdah', 'السجدة', 30, 21, 'Makkiyah'),
(33, 'Al-Ahzab', 'الأحزاب', 73, 21, 'Madaniyah'),
(34, 'Saba''', 'سبأ', 54, 22, 'Makkiyah'),
(35, 'Fatir', 'فاطر', 45, 22, 'Makkiyah'),
(36, 'Yasin', 'يس', 83, 22, 'Makkiyah'),
(37, 'As-Saffat', 'الصافات', 182, 23, 'Makkiyah'),
(38, 'Sad', 'ص', 88, 23, 'Makkiyah'),
(39, 'Az-Zumar', 'الزمر', 75, 23, 'Makkiyah'),
(40, 'Ghafir', 'غافر', 85, 24, 'Makkiyah'),
(41, 'Fussilat', 'فصلت', 54, 24, 'Makkiyah'),
(42, 'Asy-Syura', 'الشورى', 53, 25, 'Makkiyah'),
(43, 'Az-Zukhruf', 'الزخرف', 89, 25, 'Makkiyah'),
(44, 'Ad-Dukhan', 'الدخان', 59, 25, 'Makkiyah'),
(45, 'Al-Jasiyah', 'الجاثية', 37, 25, 'Makkiyah'),
(46, 'Al-Ahqaf', 'الأحقاف', 35, 26, 'Makkiyah'),
(47, 'Muhammad', 'محمد', 38, 26, 'Madaniyah'),
(48, 'Al-Fath', 'الفتح', 29, 26, 'Madaniyah'),
(49, 'Al-Hujurat', 'الحجرات', 18, 26, 'Madaniyah'),
(50, 'Qaf', 'ق', 45, 26, 'Makkiyah'),
(51, 'Az-Zariyat', 'الذاريات', 60, 26, 'Makkiyah'),
(52, 'At-Tur', 'الطور', 49, 27, 'Makkiyah'),
(53, 'An-Najm', 'النجم', 62, 27, 'Makkiyah'),
(54, 'Al-Qamar', 'القمر', 55, 27, 'Makkiyah'),
(55, 'Ar-Rahman', 'الرحمن', 78, 27, 'Madaniyah'),
(56, 'Al-Waqi''ah', 'الواقعة', 96, 27, 'Makkiyah'),
(57, 'Al-Hadid', 'الحديد', 29, 27, 'Madaniyah'),
(58, 'Al-Mujadilah', 'المجادلة', 22, 28, 'Madaniyah'),
(59, 'Al-Hasyr', 'الحشر', 24, 28, 'Madaniyah'),
(60, 'Al-Mumtahanah', 'الممتحنة', 13, 28, 'Madaniyah'),
(61, 'As-Saff', 'الصف', 14, 28, 'Madaniyah'),
(62, 'Al-Jumu''ah', 'الجمعة', 11, 28, 'Madaniyah'),
(63, 'Al-Munafiqun', 'المنافقون', 11, 28, 'Madaniyah'),
(64, 'At-Taghabun', 'التغابن', 18, 28, 'Madaniyah'),
(65, 'At-Talaq', 'الطلاق', 12, 28, 'Madaniyah'),
(66, 'At-Tahrim', 'التحريم', 12, 28, 'Madaniyah'),
(67, 'Al-Mulk', 'الملك', 30, 29, 'Makkiyah'),
(68, 'Al-Qalam', 'القلم', 52, 29, 'Makkiyah'),
(69, 'Al-Haqqah', 'الحاقة', 52, 29, 'Makkiyah'),
(70, 'Al-Ma''arij', 'المعارج', 44, 29, 'Makkiyah'),
(71, 'Nuh', 'نوح', 28, 29, 'Makkiyah'),
(72, 'Al-Jinn', 'الجن', 28, 29, 'Makkiyah'),
(73, 'Al-Muzzammil', 'المزمل', 20, 29, 'Makkiyah'),
(74, 'Al-Muddassir', 'المدثر', 56, 29, 'Makkiyah'),
(75, 'Al-Qiyamah', 'القيامة', 40, 29, 'Makkiyah'),
(76, 'Al-Insan', 'الإنسان', 31, 29, 'Madaniyah'),
(77, 'Al-Mursalat', 'المرسلات', 50, 29, 'Makkiyah'),
(78, 'An-Naba''', 'النبأ', 40, 30, 'Makkiyah'),
(79, 'An-Nazi''at', 'النازعات', 46, 30, 'Makkiyah'),
(80, '''Abasa', 'عبس', 42, 30, 'Makkiyah'),
(81, 'At-Takwir', 'التكوير', 29, 30, 'Makkiyah'),
(82, 'Al-Infitar', 'الانفطار', 19, 30, 'Makkiyah'),
(83, 'Al-Mutaffifin', 'المطففين', 36, 30, 'Makkiyah'),
(84, 'Al-Insyiqaq', 'الانشقاق', 25, 30, 'Makkiyah'),
(85, 'Al-Buruj', 'البروج', 22, 30, 'Makkiyah'),
(86, 'At-Tariq', 'الطارق', 17, 30, 'Makkiyah'),
(87, 'Al-A''la', 'الأعلى', 19, 30, 'Makkiyah'),
(88, 'Al-Ghasyiyah', 'الغاشية', 26, 30, 'Makkiyah'),
(89, 'Al-Fajr', 'الفجر', 30, 30, 'Makkiyah'),
(90, 'Al-Balad', 'البلد', 20, 30, 'Makkiyah'),
(91, 'Asy-Syams', 'الشمس', 15, 30, 'Makkiyah'),
(92, 'Al-Lail', 'الليل', 21, 30, 'Makkiyah'),
(93, 'Ad-Duha', 'الضحى', 11, 30, 'Makkiyah'),
(94, 'Asy-Syarh', 'الشرح', 8, 30, 'Makkiyah'),
(95, 'At-Tin', 'التين', 8, 30, 'Makkiyah'),
(96, 'Al-''Alaq', 'العلق', 19, 30, 'Makkiyah'),
(97, 'Al-Qadr', 'القدر', 5, 30, 'Makkiyah'),
(98, 'Al-Bayyinah', 'البينة', 8, 30, 'Madaniyah'),
(99, 'Az-Zalzalah', 'الزلزلة', 8, 30, 'Madaniyah'),
(100, 'Al-''Adiyat', 'العاديات', 11, 30, 'Makkiyah'),
(101, 'Al-Qari''ah', 'القارعة', 11, 30, 'Makkiyah'),
(102, 'At-Takasur', 'التكاثر', 8, 30, 'Makkiyah'),
(103, 'Al-''Asr', 'العصر', 3, 30, 'Makkiyah'),
(104, 'Al-Humazah', 'الهمزة', 9, 30, 'Makkiyah'),
(105, 'Al-Fil', 'الفيل', 5, 30, 'Makkiyah'),
(106, 'Quraisy', 'قريش', 4, 30, 'Makkiyah'),
(107, 'Al-Ma''un', 'الماعون', 7, 30, 'Makkiyah'),
(108, 'Al-Kausar', 'الكوثر', 3, 30, 'Makkiyah'),
(109, 'Al-Kafirun', 'الكافرون', 6, 30, 'Makkiyah'),
(110, 'An-Nasr', 'النصر', 3, 30, 'Madaniyah'),
(111, 'Al-Lahab', 'اللهب', 5, 30, 'Makkiyah'),
(112, 'Al-Ikhlas', 'الإخلاص', 4, 30, 'Makkiyah'),
(113, 'Al-Falaq', 'الفلق', 5, 30, 'Makkiyah'),
(114, 'An-Nas', 'الناس', 6, 30, 'Makkiyah')
ON DUPLICATE KEY UPDATE name_latin=VALUES(name_latin);

-- SEED DEMO USERS (Password for all: password123 -> $2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa)
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password_hash`, `role`, `status`) VALUES
(1, 'admin', 'admin@tahfidznur.sch.id', '081234567890', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'admin', 'active'),
(2, 'ustadz.ahmad', 'ahmad@tahfidznur.sch.id', '081234567891', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'guru', 'active'),
(3, 'ustadzah.maryam', 'maryam@tahfidznur.sch.id', '081234567892', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'guru', 'active'),
(4, 'wali.ahmad', 'wali.ahmad@gmail.com', '081234567893', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'orang_tua', 'active'),
(5, 'ahmad.fauzan', 'ahmad.fauzan@student.sch.id', '081234567894', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'santri', 'active'),
(6, 'fatimah.azzahra', 'fatimah@student.sch.id', '081234567895', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'santri', 'active'),
(7, 'muhammad.ali', 'ali@student.sch.id', '081234567896', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'santri', 'active'),
(8, 'aisyah.humaira', 'aisyah@student.sch.id', '081234567897', '$2a$10$WoOzeRv4w602SK3nd9htFu57/ZkoC9uT6zzrBTMdBkpk6ZzzKGPoa', 'santri', 'active')
ON DUPLICATE KEY UPDATE username=VALUES(username);

-- SEED TEACHERS
INSERT INTO `teachers` (`id`, `user_id`, `nip`, `full_name`, `gender`, `phone`, `email`, `address`, `is_active`) VALUES
(1, 2, 'GUR-2024001', 'Ustadz Ahmad Fauzi, S.Pd.I', 'L', '081234567891', 'ahmad@tahfidznur.sch.id', 'Jl. Nurul Iman No. 12, Bandung', 1),
(2, 3, 'GUR-2024002', 'Ustadzah Maryam Al-Hafidzah', 'P', '081234567892', 'maryam@tahfidznur.sch.id', 'Jl. Pesantren No. 5, Bandung', 1)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- SEED PARENTS
INSERT INTO `parents` (`id`, `user_id`, `full_name`, `phone`, `email`, `address`) VALUES
(1, 4, 'Bapak Fauzi Ridwan', '081234567893', 'wali.ahmad@gmail.com', 'Jl. Melati Blok C4, Bandung')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- SEED GROUPS
INSERT INTO `groups` (`id`, `name`, `teacher_id`, `description`, `schedule_days`, `schedule_time`, `target_description`, `is_active`) VALUES
(1, 'Tahfidz A (Ikhwan Unggulan)', 1, 'Kelompok Tahfidz Putra tingkat dasar - menengah', 'Senin - Jumat', '16:00 - 17:30', 'Target Khatam Juz 30 & 29', 1),
(2, 'Tahfidz B (Akhwat Unggulan)', 2, 'Kelompok Tahfidz Putri tingkat dasar - menengah', 'Senin - Jumat', '16:00 - 17:30', 'Target Khatam Juz 30 & 29', 1),
(3, 'Tahfidz C (Reguler Remaja)', 1, 'Kelompok Tahfidz sore santri reguler', 'Senin, Rabu, Jumat', '18:30 - 20:00', 'Target Juz 30', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- SEED STUDENTS
INSERT INTO `students` (`id`, `user_id`, `parent_id`, `nis`, `nik`, `full_name`, `gender`, `birth_place`, `birth_date`, `address`, `phone`, `parent_name`, `parent_phone`, `join_date`, `target_juz`, `status`) VALUES
(1, 5, 1, 'SNT-2026001', '3273010101100001', 'Ahmad Fauzan', 'L', 'Bandung', '2012-05-14', 'Jl. Melati Blok C4, Bandung', '081234567894', 'Fauzi Ridwan', '081234567893', '2025-07-01', 'Juz 30 & 29', 'active'),
(2, 6, NULL, 'SNT-2026002', '3273010101100002', 'Fatimah Az-Zahra', 'P', 'Bandung', '2013-08-20', 'Jl. Sukajadi No. 44, Bandung', '081234567895', 'Abdullah Rahman', '081299887711', '2025-07-01', 'Juz 30 & 29', 'active'),
(3, 7, NULL, 'SNT-2026003', '3273010101100003', 'Muhammad Ali', 'L', 'Bandung', '2012-11-03', 'Jl. Setiabudi No. 10, Bandung', '081234567896', 'Hasan Basri', '081299887722', '2025-07-01', 'Juz 30', 'active'),
(4, 8, NULL, 'SNT-2026004', '3273010101100004', 'Aisyah Humaira', 'P', 'Cimahi', '2014-02-15', 'Jl. Cihanjuang No. 88, Cimahi', '081234567897', 'Umar Faruq', '081299887733', '2025-07-01', 'Juz 30', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- SEED GROUP MEMBERS
INSERT INTO `group_members` (`id`, `group_id`, `student_id`) VALUES
(1, 1, 1),
(2, 1, 3),
(3, 2, 2),
(4, 2, 4)
ON DUPLICATE KEY UPDATE group_id=VALUES(group_id);

-- SEED MEMORIZATION TARGETS
INSERT INTO `memorization_targets` (`id`, `student_id`, `target_title`, `target_juz`, `target_surah_id`, `start_date`, `end_date`, `status`, `progress_percent`, `notes`) VALUES
(1, 1, 'Target Selesai Juz 30', 30, 78, '2026-01-01', '2026-06-30', 'completed', 100, 'Alhamdulillah telah menyelesaikan Juz 30 dengan predikat Jayyid Jiddan'),
(2, 1, 'Target Menyelesaikan Juz 29', 29, 67, '2026-07-01', '2026-12-31', 'in_progress', 72, 'Sedang menghafal Surah Al-Mulk s.d Al-Qalam')
ON DUPLICATE KEY UPDATE target_title=VALUES(target_title);

-- SEED MEMORIZATION REPORTS
INSERT INTO `memorization_reports` (`id`, `student_id`, `teacher_id`, `group_id`, `date`, `type`, `surah_id`, `surah_name`, `start_ayah`, `end_ayah`, `total_ayahs`, `juz_number`, `score`, `notes`) VALUES
(1, 1, 1, 1, '2026-08-24', 'NEW_MEMORIZATION', 67, 'Al-Mulk', 1, 10, 10, 29, 'A', 'Hafalan lancar, tajwid dan makharijul huruf sangat baik.'),
(2, 1, 1, 1, '2026-08-24', 'DAILY_MUROJAAH', 78, 'An-Naba''', 1, 40, 40, 30, 'A', 'Murojaah sangat mantap dan mutqin.'),
(3, 3, 1, 1, '2026-08-24', 'NEW_MEMORIZATION', 78, 'An-Naba''', 1, 15, 15, 30, 'B', 'Hafalan cukup baik, perhatikan mad wajib dan ikhfa.'),
(4, 2, 2, 2, '2026-08-24', 'NEW_MEMORIZATION', 67, 'Al-Mulk', 11, 20, 10, 29, 'A', 'MasyaAllah bacaan tartil dan tartib.'),
(5, 4, 2, 2, '2026-08-24', 'DAILY_MUROJAAH', 80, '''Abasa', 1, 42, 42, 30, 'A', 'Murojaah lancar tanpa bimbingan.')
ON DUPLICATE KEY UPDATE notes=VALUES(notes);

-- SEED ATTENDANCE
INSERT INTO `attendance` (`id`, `student_id`, `group_id`, `teacher_id`, `date`, `status`, `notes`) VALUES
(1, 1, 1, 1, '2026-08-24', 'hadir', 'Tepat waktu'),
(2, 3, 1, 1, '2026-08-24', 'hadir', 'Tepat waktu'),
(3, 2, 2, 2, '2026-08-24', 'hadir', 'Tepat waktu'),
(4, 4, 2, 2, '2026-08-24', 'hadir', 'Tepat waktu')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- SEED AUDIT LOG
INSERT INTO `audit_logs` (`user_id`, `user_name`, `user_role`, `action`, `entity_type`, `entity_id`, `new_values`, `ip_address`) VALUES
(1, 'Admin Yayasan', 'admin', 'SYSTEM_INITIALIZATION', 'SYSTEM', 1, '{"message":"Initial setup and seed database completed"}', '127.0.0.1');
