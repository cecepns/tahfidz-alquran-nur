-- ==============================================================================
-- MIGRATION: Dukungan Murojaah Mingguan (WEEKLY_MUROJAAH)
-- Database: tahfidz_nur
-- Yayasan Tahfidz Alquran Nur
-- ==============================================================================

USE `tahfidz_nur`;

-- 1. Pastikan ENUM kolom `type` pada tabel `memorization_reports` mencakup WEEKLY_MUROJAAH
ALTER TABLE `memorization_reports` 
MODIFY COLUMN `type` ENUM('NEW_MEMORIZATION', 'DAILY_MUROJAAH', 'WEEKLY_MUROJAAH') 
NOT NULL DEFAULT 'NEW_MEMORIZATION';

-- 2. Pastikan Index performa untuk pencarian laporan berdasarkan santri, tanggal, dan tipe
SET @exist_idx := (
  SELECT COUNT(*) 
  FROM information_schema.statistics 
  WHERE table_schema = DATABASE() 
    AND table_name = 'memorization_reports' 
    AND index_name = 'idx_mr_student_date_type'
);

SET @sql_create_idx = IF(
  @exist_idx = 0,
  'CREATE INDEX `idx_mr_student_date_type` ON `memorization_reports` (`student_id`, `date`, `type`)',
  'SELECT "Index idx_mr_student_date_type sudah ada"'
);

PREPARE stmt FROM @sql_create_idx;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Verifikasi struktur tabel
DESCRIBE `memorization_reports`;
