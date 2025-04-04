-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Anamakine: 127.0.0.1
-- Üretim Zamanı: 04 Nis 2025, 04:17:28
-- Sunucu sürümü: 10.4.32-MariaDB
-- PHP Sürümü: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Veritabanı: `askeri_belge_takip`
--

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `auth`
--

CREATE TABLE `auth` (
  `id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `role` enum('admin','supervisor','user') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Tablo döküm verisi `auth`
--

INSERT INTO `auth` (`id`, `email`, `password`, `created_at`, `updated_at`, `last_login`, `is_active`, `role`) VALUES
(1, 'admin@admin.com', '$2a$10$ST5uNBeIlWzfEeO6hWZq8eXjB3wFbbxTzU40oIxHsOHctZkWplmuS', '2025-04-04 02:05:00', '2025-04-04 02:08:28', NULL, 1, 'admin'),
(2, 'admin@example.com', '$2a$10$ST5uNBeIlWzfEeO6hWZq8eXjB3wFbbxTzU40oIxHsOHctZkWplmuS', '2025-04-04 02:09:08', '2025-04-04 02:11:03', NULL, 1, 'admin'),
(3, 'supervisor@example.com', '$2a$10$ST5uNBeIlWzfEeO6hWZq8eXjB3wFbbxTzU40oIxHsOHctZkWplmuS', '2025-04-04 02:09:08', '2025-04-04 02:11:08', NULL, 1, 'supervisor'),
(4, 'user@example.com', '$2a$10$ST5uNBeIlWzfEeO6hWZq8eXjB3wFbbxTzU40oIxHsOHctZkWplmuS', '2025-04-04 02:09:08', '2025-04-04 02:10:52', NULL, 1, 'user');

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `document_no` varchar(50) NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `personnel_name` varchar(100) NOT NULL,
  `personnel_rank` varchar(100) NOT NULL,
  `personnel_id` varchar(20) NOT NULL,
  `document_date` datetime NOT NULL,
  `status` varchar(100) NOT NULL DEFAULT 'Beklemede',
  `processed_by` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

--
-- Tablo döküm verisi `documents`
--

INSERT INTO `documents` (`id`, `document_no`, `document_type`, `personnel_name`, `personnel_rank`, `personnel_id`, `document_date`, `status`, `processed_by`, `description`, `created_at`, `updated_at`, `deleted_at`, `is_deleted`) VALUES
(50, '2024/IZN/001', 'İzin Belgesi', 'Ahmet Yılmaz', 'Üsteğmen', 'P-123456', '2024-03-15 03:00:00', 'Onaylandı', 'Binbaşı Mehmet Demir', 'Yıllık izin talebi', '2025-04-04 05:12:30', '2025-04-04 05:16:45', NULL, 0),
(51, '2024/IZN/002', 'İzin Belgesi', 'Mustafa Kaya', 'Astsubay', 'P-234567', '2024-03-16 10:30:00', 'Beklemede', 'Yüzbaşı Ali Yıldız', 'Mazeret izni talebi', '2025-04-04 05:12:30', NULL, NULL, 0),
(52, '2024/IZN/003', 'İzin Belgesi', 'Ayşe Demir', 'Teğmen', 'P-345678', '2024-03-17 11:15:00', 'İşlemde', 'Albay Hakan Çelik', 'Sağlık izni talebi', '2025-04-04 05:12:30', NULL, NULL, 0),
(53, '2024/GRV/001', 'Görev Emri', 'Mehmet Öz', 'Binbaşı', 'P-456789', '2024-03-18 14:00:00', 'Onaylandı', 'Albay Serkan Yılmaz', 'Geçici görev emri', '2025-04-04 05:12:30', NULL, NULL, 0),
(54, '2024/GRV/002', 'Görev Emri', 'Zeynep Aydın', 'Yüzbaşı', 'P-567890', '2024-03-19 15:30:00', 'Tamamlandı', 'Albay Hakan Çelik', 'Eğitim görevi', '2025-04-04 05:12:30', NULL, NULL, 0),
(55, '2024/GRV/003', 'Görev Emri', 'Can Özdemir', 'Teğmen', 'P-678901', '2024-03-20 16:45:00', 'İptal Edildi', 'Binbaşı Ahmet Kara', 'Tatbikat görevi', '2025-04-04 05:12:30', NULL, NULL, 0),
(56, '2024/SGK/001', 'Sağlık Raporu', 'Ali Yıldız', 'Çavuş', 'P-789012', '2024-03-21 09:30:00', 'Onaylandı', 'Dr. Ayşe Yılmaz', 'İstirahat raporu', '2025-04-04 05:12:30', NULL, NULL, 0),
(57, '2024/SGK/002', 'Sağlık Raporu', 'Fatma Çelik', 'Uzman Çavuş', 'P-890123', '2024-03-22 10:45:00', 'Beklemede', 'Dr. Mehmet Öz', 'Kontrol muayenesi', '2025-04-04 05:12:30', NULL, NULL, 0),
(58, '2024/SGK/003', 'Sağlık Raporu', 'Emre Kaya', 'Er', 'P-901234', '2024-03-23 11:30:00', 'İşlemde', 'Dr. Zeynep Demir', 'Tedavi raporu', '2025-04-04 05:12:30', NULL, NULL, 0),
(59, '2024/TRH/001', 'Terhis Belgesi', 'Burak Şahin', 'Er', 'P-012345', '2024-03-24 13:15:00', 'Onaylandı', 'Yüzbaşı Mehmet Yılmaz', 'Normal terhis', '2025-04-04 05:12:30', NULL, NULL, 0),
(60, '2024/TRH/002', 'Terhis Belgesi', 'Deniz Arslan', 'Er', 'P-123456', '2024-03-25 14:30:00', 'Beklemede', 'Binbaşı Ali Kaya', 'Erken terhis talebi', '2025-04-04 05:12:30', NULL, NULL, 0),
(61, '2024/TRH/003', 'Terhis Belgesi', 'Mert Aydın', 'Er', 'P-234567', '2024-03-26 15:45:00', 'İşlemde', 'Yarbay Ahmet Demir', 'Malulen terhis', '2025-04-04 05:12:30', NULL, NULL, 0),
(62, '2024/DGR/001', 'Diğer', 'Selin Yılmaz', 'Astsubay', 'P-345678', '2024-03-27 10:00:00', 'Onaylandı', 'Albay Mehmet Öz', 'Takdir belgesi', '2025-04-04 05:12:30', NULL, NULL, 0),
(63, '2024/DGR/002', 'Diğer', 'Onur Kaya', 'Teğmen', 'P-456789', '2024-03-28 11:15:00', 'Beklemede', 'Yarbay Ali Demir', 'Başarı belgesi', '2025-04-04 05:12:30', NULL, NULL, 0),
(64, '2024/DGR/003', 'Diğer', 'Elif Çelik', 'Yüzbaşı', 'P-567890', '2024-03-29 12:30:00', 'İşlemde', 'Albay Hakan Yılmaz', 'Teşekkür belgesi', '2025-04-04 05:12:30', NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Tablo için tablo yapısı `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `action_type` enum('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','STATUS_CHANGE') DEFAULT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int(11) DEFAULT NULL,
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_data`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Tablo döküm verisi `logs`
--

INSERT INTO `logs` (`id`, `user_id`, `action_type`, `table_name`, `record_id`, `old_data`, `new_data`, `ip_address`, `user_agent`, `created_at`) VALUES
(2, 1, 'LOGIN', 'auth', 1, NULL, '{\"email\":\"admin@admin.com\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 02:08:36'),
(8, 1, 'UPDATE', 'documents', 50, '{\"id\":50,\"document_no\":\"2024/IZN/0011\",\"document_type\":\"İzin Belgesi\",\"personnel_name\":\"Ahmet Yılmaz\",\"personnel_rank\":\"Üsteğmen\",\"personnel_id\":\"P-123456\",\"document_date\":\"2024-03-15T03:00:00.000Z\",\"status\":\"Onaylandı\",\"processed_by\":\"Binbaşı Mehmet Demir\",\"description\":\"Yıllık izin talebi\",\"created_at\":\"2025-04-04T02:12:30.000Z\",\"updated_at\":\"2025-04-04T02:15:51.000Z\",\"deleted_at\":null,\"is_deleted\":0}', '{\"document_no\":\"2024/IZN/001\",\"document_type\":\"İzin Belgesi\",\"personnel_name\":\"Ahmet Yılmaz\",\"personnel_rank\":\"Üsteğmen\",\"personnel_id\":\"P-123456\",\"document_date\":\"2024-03-15T03:00:00.000Z\",\"status\":\"Onaylandı\",\"processed_by\":\"Binbaşı Mehmet Demir\",\"description\":\"Yıllık izin talebi\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', '2025-04-04 02:16:45');

--
-- Dökümü yapılmış tablolar için indeksler
--

--
-- Tablo için indeksler `auth`
--
ALTER TABLE `auth`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- Tablo için indeksler `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_personnel_id` (`personnel_id`),
  ADD KEY `idx_document_date` (`document_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_is_deleted` (`is_deleted`),
  ADD KEY `idx_personnel_name` (`personnel_name`),
  ADD KEY `idx_processed_by` (`processed_by`);

--
-- Tablo için indeksler `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_action` (`action_type`),
  ADD KEY `idx_table` (`table_name`),
  ADD KEY `idx_record` (`record_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Dökümü yapılmış tablolar için AUTO_INCREMENT değeri
--

--
-- Tablo için AUTO_INCREMENT değeri `auth`
--
ALTER TABLE `auth`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Tablo için AUTO_INCREMENT değeri `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- Tablo için AUTO_INCREMENT değeri `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Dökümü yapılmış tablolar için kısıtlamalar
--

--
-- Tablo kısıtlamaları `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `auth` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
