-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.34 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for tigerroutesdb
CREATE DATABASE IF NOT EXISTS `tigerroutesdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `tigerroutesdb`;

-- Dumping structure for table tigerroutesdb.tbl_bigfiveresults
CREATE TABLE IF NOT EXISTS `tbl_bigfiveresults` (
  `bigFiveResult_ID` int NOT NULL AUTO_INCREMENT,
  `openness` int NOT NULL DEFAULT (0),
  `conscientiousness` int NOT NULL DEFAULT (0),
  `extraversion` int NOT NULL DEFAULT (0),
  `agreeableness` int NOT NULL DEFAULT (0),
  `neuroticism` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`bigFiveResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_bigfiveresults: ~0 rows (approximately)
INSERT INTO `tbl_bigfiveresults` (`bigFiveResult_ID`, `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism`) VALUES
	(30, 63, 83, 83, 77, 53),
	(31, 67, 63, 53, 60, 53),
	(32, 67, 67, 57, 57, 73);

-- Dumping structure for table tigerroutesdb.tbl_colleges
CREATE TABLE IF NOT EXISTS `tbl_colleges` (
  `collegeID` int NOT NULL AUTO_INCREMENT,
  `collegeName` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `collegeUSTlink` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`collegeID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_colleges: ~20 rows (approximately)
INSERT INTO `tbl_colleges` (`collegeID`, `collegeName`, `collegeUSTlink`) VALUES
	(1, 'Faculty of Arts and Letters', NULL),
	(2, 'Faculty of Civil Law', NULL),
	(3, 'Faculty of Engineering', NULL),
	(4, 'Faculty of Medicine and Surgery', NULL),
	(5, 'Faculty of Pharmacy', NULL),
	(6, 'Faculty of Philosophy', NULL),
	(7, 'Faculty of Sacred Theology', NULL),
	(8, 'Faculty of Canon Law', NULL),
	(9, 'College of Architecture', NULL),
	(10, 'College of Commerce and Business Administration', NULL),
	(11, 'College of Education', NULL),
	(12, 'College of Fine Arts and Design', NULL),
	(13, 'College of Nursing', NULL),
	(14, 'College of Rehabilitation Sciences', NULL),
	(15, 'College of Science', NULL),
	(16, 'College of Tourism and Hospitality Management', NULL),
	(17, 'Conservatory of Music', NULL),
	(18, 'College of Information and Computing Sciences', NULL),
	(19, 'UST-Alfredo M. Velayo College of Accountancy', NULL),
	(20, 'Institute of Physical Education and Athletics', NULL);

-- Dumping structure for table tigerroutesdb.tbl_counselornotes
CREATE TABLE IF NOT EXISTS `tbl_counselornotes` (
  `counselorNote_ID` int NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `staffAccount_ID` int NOT NULL,
  `counselorNotes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`counselorNote_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `staffAccount_ID` (`staffAccount_ID`),
  CONSTRAINT `FK_tbl_counselornotes_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_counselornotes_ibfk_2` FOREIGN KEY (`staffAccount_ID`) REFERENCES `tbl_staffaccounts` (`staffAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_counselornotes: ~1 rows (approximately)
INSERT INTO `tbl_counselornotes` (`counselorNote_ID`, `studentAssessment_ID`, `staffAccount_ID`, `counselorNotes`) VALUES
	(1, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 1, 'This feedback is useful, thanks.');

-- Dumping structure for table tigerroutesdb.tbl_programs
CREATE TABLE IF NOT EXISTS `tbl_programs` (
  `program_ID` int NOT NULL AUTO_INCREMENT,
  `collegeID` int NOT NULL DEFAULT '0',
  `programName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `programDescription` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `careerPaths` json DEFAULT NULL,
  `programUSTlink` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`program_ID`),
  KEY `FK_tbl_programs_tbl_colleges` (`collegeID`),
  CONSTRAINT `FK_tbl_programs_tbl_colleges` FOREIGN KEY (`collegeID`) REFERENCES `tbl_colleges` (`collegeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_programs: ~14 rows (approximately)
INSERT INTO `tbl_programs` (`program_ID`, `collegeID`, `programName`, `programDescription`, `careerPaths`, `programUSTlink`) VALUES
	(1, 18, 'BS Computer Science', 'Focuses on computing principles, algorithms, and software development.', '["Software Engineer", "Data Analyst", "AI Researcher", "Systems Developer"]', NULL),
	(2, 19, 'BS Accountancy', 'Provides comprehensive training in accounting, auditing, taxation, and financial management.', '["Certified Public Accountant", "Auditor", "Financial Analyst", "Tax Consultant"]', NULL),
	(3, 11, 'BS Psychology', 'Studies human behavior, cognition, and emotions to prepare for counseling, HR, or research careers.', '["Clinical Psychologist", "HR Specialist", "Guidance Counselor", "Research Analyst"]', NULL),
	(4, 9, 'BS Architecture', 'Combines art, design, and engineering in creating functional and aesthetic structures.', '["Architect", "Urban Planner", "Interior Designer", "Construction Consultant"]', NULL),
	(5, 16, 'BS Hospitality Management', 'Trains students in hospitality operations, management, and customer service excellence.', '["Hotel Manager", "Event Coordinator", "Food and Beverage Supervisor", "Resort Operations Manager"]', NULL),
	(6, 3, 'BS Civil Engineering', 'Covers structural design, construction management, and infrastructure development.', '["Civil Engineer", "Structural Engineer", "Project Manager", "Site Engineer"]', NULL),
	(7, 13, 'BS Nursing', 'Prepares students to provide holistic patient care and promotes wellness through evidence-based practice.', '["Registered Nurse", "Clinical Instructor", "Public Health Nurse", "Research Nurse"]', NULL),
	(8, 17, 'BS Music', 'Develops skills in music theory, performance, and education across various genres and instruments.', '["Performer", "Composer", "Music Teacher", "Sound Engineer"]', NULL),
	(9, 20, 'BS Physical Education', 'Focuses on physical fitness, sports science, and wellness education.', '["PE Teacher", "Sports Coach", "Fitness Trainer", "Athletic Director"]', NULL),
	(10, 1, 'BS Political Science', 'Explores governance, political theory, and international relations for public service careers.', '["Political Analyst", "Legislative Aide", "Public Administrator", "Diplomat"]', NULL),
	(11, 4, 'BS Biology', 'The BS Biology program provides a strong foundation in the biological sciences, preparing students for careers in research, medicine, and biotechnology.', '["Biologist", "Environmental Scientist", "Research Assistant", "Laboratory Technician"]', NULL),
	(12, 5, 'BS Medical Technology', 'Trains students in laboratory analysis, medical diagnostics, and healthcare laboratory sciences.', '["Medical Technologist", "Laboratory Analyst", "Pathology Assistant", "Clinical Researcher"]', NULL),
	(13, 1, 'BA Communication', 'Prepares students for careers in journalism, media production, and public relations, focusing on strategic communication and digital literacy.', '["Journalist", "Public Relations Officer", "Media Producer", "Corporate Communicator"]', NULL),
	(14, 10, 'BS Entrepreneurship', 'Focuses on innovation, creativity, and business management for aspiring entrepreneurs and business owners.', '["Entrepreneur", "Business Consultant", "Startup Founder", "Product Manager"]', NULL);

-- Dumping structure for table tigerroutesdb.tbl_recommendations
CREATE TABLE IF NOT EXISTS `tbl_recommendations` (
  `recommendation_ID` int NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `program_ID` int NOT NULL,
  `alignmentScore` decimal(5,2) NOT NULL,
  `breakdown` json DEFAULT NULL,
  `track_aligned` enum('Y','N') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`recommendation_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `program_ID` (`program_ID`),
  CONSTRAINT `FK_tbl_recommendations_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_recommendations_ibfk_2` FOREIGN KEY (`program_ID`) REFERENCES `tbl_programs` (`program_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_recommendations: ~20 rows (approximately)
INSERT INTO `tbl_recommendations` (`recommendation_ID`, `studentAssessment_ID`, `program_ID`, `alignmentScore`, `breakdown`, `track_aligned`) VALUES
	(59, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 3, 73.00, '{"Track": 80, "RIASEC": 45, "BigFive": 90, "Academic": 100}', 'Y'),
	(60, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 12, 70.50, '{"Track": 100, "RIASEC": 45, "BigFive": 75, "Academic": 100}', 'Y'),
	(61, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 6, 69.00, '{"Track": 100, "RIASEC": 45, "BigFive": 70, "Academic": 100}', 'Y'),
	(62, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 7, 68.00, '{"Track": 90, "RIASEC": 30, "BigFive": 90, "Academic": 100}', 'Y'),
	(63, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 2, 66.50, '{"Track": 80, "RIASEC": 40, "BigFive": 75, "Academic": 100}', 'Y'),
	(64, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 9, 84.00, '{"Track": 70, "RIASEC": 75, "BigFive": 90, "Academic": 100}', 'N'),
	(65, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 10, 74.00, '{"Track": 60, "RIASEC": 60, "BigFive": 80, "Academic": 100}', 'N'),
	(66, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 14, 73.00, '{"Track": 60, "RIASEC": 50, "BigFive": 90, "Academic": 100}', 'N'),
	(67, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 13, 70.00, '{"Track": 60, "RIASEC": 65, "BigFive": 60, "Academic": 100}', 'N'),
	(68, '4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 5, 68.00, '{"Track": 70, "RIASEC": 35, "BigFive": 90, "Academic": 100}', 'N'),
	(69, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 1, 71.00, '{"Track": 100, "RIASEC": 65, "BigFive": 50, "Academic": 100}', 'Y'),
	(70, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 11, 68.50, '{"Track": 100, "RIASEC": 55, "BigFive": 55, "Academic": 100}', 'Y'),
	(71, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 12, 68.50, '{"Track": 100, "RIASEC": 55, "BigFive": 55, "Academic": 100}', 'Y'),
	(72, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 4, 67.50, '{"Track": 100, "RIASEC": 75, "BigFive": 25, "Academic": 100}', 'Y'),
	(73, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 6, 67.50, '{"Track": 100, "RIASEC": 60, "BigFive": 45, "Academic": 100}', 'Y'),
	(74, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 8, 70.00, '{"Track": 50, "RIASEC": 75, "BigFive": 50, "Academic": 100}', 'N'),
	(75, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 10, 66.00, '{"Track": 60, "RIASEC": 40, "BigFive": 80, "Academic": 100}', 'N'),
	(76, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 13, 65.00, '{"Track": 60, "RIASEC": 75, "BigFive": 30, "Academic": 100}', 'N'),
	(77, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 9, 57.00, '{"Track": 70, "RIASEC": 30, "BigFive": 60, "Academic": 100}', 'N'),
	(78, 'f0e819ac-aa13-4f3d-999d-67fa88ad469b', 5, 51.00, '{"Track": 70, "RIASEC": 15, "BigFive": 60, "Academic": 100}', 'N'),
	(79, '722a56f9-310a-4dc5-bdef-e6dacac28576', 4, 73.00, '{"Track": 100, "RIASEC": 70, "BigFive": 50, "Academic": 100}', 'Y'),
	(80, '722a56f9-310a-4dc5-bdef-e6dacac28576', 3, 72.00, '{"Track": 80, "RIASEC": 65, "BigFive": 60, "Academic": 100}', 'Y'),
	(81, '722a56f9-310a-4dc5-bdef-e6dacac28576', 1, 69.00, '{"Track": 100, "RIASEC": 60, "BigFive": 50, "Academic": 100}', 'Y'),
	(82, '722a56f9-310a-4dc5-bdef-e6dacac28576', 11, 68.50, '{"Track": 100, "RIASEC": 55, "BigFive": 55, "Academic": 100}', 'Y'),
	(83, '722a56f9-310a-4dc5-bdef-e6dacac28576', 7, 66.00, '{"Track": 90, "RIASEC": 70, "BigFive": 30, "Academic": 100}', 'Y'),
	(84, '722a56f9-310a-4dc5-bdef-e6dacac28576', 10, 84.00, '{"Track": 60, "RIASEC": 85, "BigFive": 80, "Academic": 100}', 'N'),
	(85, '722a56f9-310a-4dc5-bdef-e6dacac28576', 14, 74.00, '{"Track": 60, "RIASEC": 75, "BigFive": 60, "Academic": 100}', 'N'),
	(86, '722a56f9-310a-4dc5-bdef-e6dacac28576', 8, 72.00, '{"Track": 50, "RIASEC": 80, "BigFive": 50, "Academic": 100}', 'N'),
	(87, '722a56f9-310a-4dc5-bdef-e6dacac28576', 5, 68.50, '{"Track": 70, "RIASEC": 70, "BigFive": 45, "Academic": 100}', 'N'),
	(88, '722a56f9-310a-4dc5-bdef-e6dacac28576', 13, 68.50, '{"Track": 60, "RIASEC": 95, "BigFive": 15, "Academic": 100}', 'N');

-- Dumping structure for table tigerroutesdb.tbl_riasecresults
CREATE TABLE IF NOT EXISTS `tbl_riasecresults` (
  `riasecResult_ID` int NOT NULL AUTO_INCREMENT,
  `realistic` int NOT NULL DEFAULT (0),
  `investigative` int NOT NULL DEFAULT (0),
  `artistic` int NOT NULL DEFAULT (0),
  `social` int NOT NULL DEFAULT (0),
  `enterprising` int NOT NULL DEFAULT (0),
  `conventional` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`riasecResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_riasecresults: ~0 rows (approximately)
INSERT INTO `tbl_riasecresults` (`riasecResult_ID`, `realistic`, `investigative`, `artistic`, `social`, `enterprising`, `conventional`) VALUES
	(30, 86, 67, 29, 100, 71, 50),
	(31, 100, 83, 86, 100, 57, 75),
	(32, 100, 83, 86, 71, 86, 63);

-- Dumping structure for table tigerroutesdb.tbl_staffaccounts
CREATE TABLE IF NOT EXISTS `tbl_staffaccounts` (
  `staffAccount_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `staffRole_ID` int DEFAULT NULL,
  `staffProfile_ID` int DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`staffAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffaccounts: ~1 rows (approximately)
INSERT INTO `tbl_staffaccounts` (`staffAccount_ID`, `name`, `email`, `password`, `staffRole_ID`, `staffProfile_ID`, `status`) VALUES
	(1, 'Owen Trinidad', 'michaelowen.trinidad.cics@ust.edu.ph', 'hello123', NULL, NULL, NULL);

-- Dumping structure for table tigerroutesdb.tbl_strands
CREATE TABLE IF NOT EXISTS `tbl_strands` (
  `strand_ID` int NOT NULL AUTO_INCREMENT,
  `strandName` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`strand_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_strands: ~4 rows (approximately)
INSERT INTO `tbl_strands` (`strand_ID`, `strandName`) VALUES
	(7, 'STEM'),
	(8, 'ABM'),
	(9, 'HUMSS'),
	(10, 'Health-Allied');

-- Dumping structure for table tigerroutesdb.tbl_studentaccounts
CREATE TABLE IF NOT EXISTS `tbl_studentaccounts` (
  `studentAccount_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `studentProfile_ID` int DEFAULT NULL,
  PRIMARY KEY (`studentAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentaccounts: ~0 rows (approximately)
INSERT INTO `tbl_studentaccounts` (`studentAccount_ID`, `name`, `email`, `password`, `studentProfile_ID`) VALUES
	(8, 'RYAN REGULACION', 'ryan.regulacion.cics@ust.edu.ph', '', 1);

-- Dumping structure for table tigerroutesdb.tbl_studentassessments
CREATE TABLE IF NOT EXISTS `tbl_studentassessments` (
  `studentAssessment_ID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `studentAccount_ID` int NOT NULL,
  `riasecResult_ID` int NOT NULL,
  `bigFiveResult_ID` int NOT NULL,
  `rating` int DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentAssessment_ID`),
  KEY `studentAccount_ID` (`studentAccount_ID`),
  KEY `riasecResult_ID` (`riasecResult_ID`),
  KEY `bigFiveResult_ID` (`bigFiveResult_ID`),
  CONSTRAINT `tbl_studentassessments_ibfk_1` FOREIGN KEY (`studentAccount_ID`) REFERENCES `tbl_studentaccounts` (`studentAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_2` FOREIGN KEY (`riasecResult_ID`) REFERENCES `tbl_riasecresults` (`riasecResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_3` FOREIGN KEY (`bigFiveResult_ID`) REFERENCES `tbl_bigfiveresults` (`bigFiveResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentassessments: ~2 rows (approximately)
INSERT INTO `tbl_studentassessments` (`studentAssessment_ID`, `studentAccount_ID`, `riasecResult_ID`, `bigFiveResult_ID`, `rating`, `feedback`, `date`) VALUES
	('4b310348-2939-47d9-b8fc-3a5b7ad0b5ce', 8, 30, 30, NULL, NULL, '2025-10-15 03:12:47'),
	('722a56f9-310a-4dc5-bdef-e6dacac28576', 8, 32, 32, NULL, NULL, '2025-10-15 07:25:13'),
	('f0e819ac-aa13-4f3d-999d-67fa88ad469b', 8, 31, 31, NULL, NULL, '2025-10-15 03:57:30');

-- Dumping structure for table tigerroutesdb.tbl_studentgrades
CREATE TABLE IF NOT EXISTS `tbl_studentgrades` (
  `studentGrades_ID` int(11) NOT NULL AUTO_INCREMENT,
  `mathGrade` double DEFAULT NULL,
  `scienceGrade` double DEFAULT NULL,
  `englishGrade` double DEFAULT NULL,
  `genAverageGrade` double DEFAULT NULL,
  PRIMARY KEY (`studentGrades_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentgrades: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_studentprofiles
CREATE TABLE IF NOT EXISTS `tbl_studentprofiles` (
  `studentProfile_ID` int(11) NOT NULL AUTO_INCREMENT,
  `strand_ID` int(11) NOT NULL,
  `gradeLevel` tinyint(4) DEFAULT NULL,
  `studentGrades_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`studentProfile_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentprofiles: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
