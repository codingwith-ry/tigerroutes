-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.4.32-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
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
CREATE DATABASE IF NOT EXISTS `tigerroutesdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `tigerroutesdb`;

-- Dumping structure for table tigerroutesdb.tbl_bigfiveresults
CREATE TABLE IF NOT EXISTS `tbl_bigfiveresults` (
  `bigFiveResult_ID` int(11) NOT NULL AUTO_INCREMENT,
  `openness` int(11) NOT NULL DEFAULT 0,
  `conscientiousness` int(11) NOT NULL DEFAULT 0,
  `artistic` int(11) NOT NULL DEFAULT 0,
  `extraversion` int(11) NOT NULL DEFAULT 0,
  `agreeableness` int(11) NOT NULL DEFAULT 0,
  `neuroticism` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`bigFiveResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_bigfiveresults: ~15 rows (approximately)
INSERT INTO `tbl_bigfiveresults` (`bigFiveResult_ID`, `openness`, `conscientiousness`, `artistic`, `extraversion`, `agreeableness`, `neuroticism`) VALUES
	(1, 57, 67, 0, 80, 50, 60),
	(2, 47, 47, 0, 57, 77, 73),
	(3, 60, 50, 0, 50, 47, 53),
	(4, 57, 70, 0, 60, 70, 60),
	(5, 73, 43, 0, 53, 50, 83),
	(6, 73, 43, 0, 53, 50, 83),
	(7, 53, 63, 0, 57, 63, 70),
	(8, 50, 50, 0, 83, 53, 70),
	(9, 87, 50, 0, 70, 47, 90),
	(10, 57, 60, 0, 57, 50, 73),
	(11, 57, 53, 0, 67, 53, 73),
	(12, 73, 53, 0, 67, 43, 73),
	(13, 73, 53, 0, 67, 43, 73),
	(14, 70, 67, 0, 60, 63, 77),
	(15, 43, 50, 0, 57, 67, 70);

-- Dumping structure for table tigerroutesdb.tbl_counselornotes
CREATE TABLE IF NOT EXISTS `tbl_counselornotes` (
  `counselorNote_ID` int(11) NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) NOT NULL DEFAULT '',
  `staffAccount_ID` int(11) NOT NULL,
  `counselorNotes` text DEFAULT NULL,
  PRIMARY KEY (`counselorNote_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `staffAccount_ID` (`staffAccount_ID`),
  CONSTRAINT `FK_tbl_counselornotes_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_counselornotes_ibfk_2` FOREIGN KEY (`staffAccount_ID`) REFERENCES `tbl_staffaccounts` (`staffAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_counselornotes: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_programs
CREATE TABLE IF NOT EXISTS `tbl_programs` (
  `program_ID` int(11) NOT NULL AUTO_INCREMENT,
  `programName` varchar(255) NOT NULL,
  `programDescription` text DEFAULT NULL,
  `careerPaths` text DEFAULT NULL,
  `programUSTlink` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`program_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_programs: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_recommendations
CREATE TABLE IF NOT EXISTS `tbl_recommendations` (
  `recommendation_ID` int(11) NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) NOT NULL DEFAULT '',
  `program_ID` int(11) NOT NULL,
  `alignmentScore` decimal(5,2) NOT NULL,
  PRIMARY KEY (`recommendation_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `program_ID` (`program_ID`),
  CONSTRAINT `FK_tbl_recommendations_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_recommendations_ibfk_2` FOREIGN KEY (`program_ID`) REFERENCES `tbl_programs` (`program_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_recommendations: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_riasecresults
CREATE TABLE IF NOT EXISTS `tbl_riasecresults` (
  `riasecResult_ID` int(11) NOT NULL AUTO_INCREMENT,
  `realistic` int(11) NOT NULL DEFAULT 0,
  `investigative` int(11) NOT NULL DEFAULT 0,
  `artistic` int(11) NOT NULL DEFAULT 0,
  `social` int(11) NOT NULL DEFAULT 0,
  `enterprising` int(11) NOT NULL DEFAULT 0,
  `conventional` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`riasecResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_riasecresults: ~15 rows (approximately)
INSERT INTO `tbl_riasecresults` (`riasecResult_ID`, `realistic`, `investigative`, `artistic`, `social`, `enterprising`, `conventional`) VALUES
	(1, 100, 100, 100, 100, 100, 100),
	(2, 100, 100, 100, 100, 100, 100),
	(3, 100, 100, 100, 100, 100, 100),
	(4, 86, 83, 71, 57, 57, 50),
	(5, 100, 100, 100, 100, 100, 100),
	(6, 100, 100, 100, 100, 100, 100),
	(7, 57, 100, 86, 86, 43, 63),
	(8, 57, 50, 71, 57, 86, 75),
	(9, 100, 100, 86, 100, 100, 100),
	(10, 86, 100, 86, 86, 86, 63),
	(11, 100, 100, 100, 100, 100, 100),
	(12, 100, 83, 71, 86, 100, 100),
	(13, 100, 83, 71, 86, 100, 100),
	(14, 57, 83, 71, 86, 57, 88),
	(15, 71, 83, 86, 86, 100, 100);

-- Dumping structure for table tigerroutesdb.tbl_staffaccounts
CREATE TABLE IF NOT EXISTS `tbl_staffaccounts` (
  `staffAccount_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(128) DEFAULT NULL,
  `staffRole_ID` int(11) DEFAULT NULL,
  `staffProfile_ID` int(11) DEFAULT NULL,
  `status` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`staffAccount_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffaccounts: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_strands
CREATE TABLE IF NOT EXISTS `tbl_strands` (
  `strand_ID` int(11) NOT NULL AUTO_INCREMENT,
  `strandName` varchar(64) NOT NULL,
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
  `studentAccount_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL DEFAULT '',
  `email` varchar(128) NOT NULL DEFAULT '',
  `password` varchar(128) NOT NULL DEFAULT '',
  `studentProfile_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`studentAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentaccounts: ~1 rows (approximately)
INSERT INTO `tbl_studentaccounts` (`studentAccount_ID`, `name`, `email`, `password`, `studentProfile_ID`) VALUES
	(8, 'RYAN REGULACION', 'ryan.regulacion.cics@ust.edu.ph', '', NULL);

-- Dumping structure for table tigerroutesdb.tbl_studentassessments
CREATE TABLE IF NOT EXISTS `tbl_studentassessments` (
  `studentAssessment_ID` char(36) NOT NULL,
  `studentAccount_ID` int(11) NOT NULL,
  `riasecResult_ID` int(11) NOT NULL,
  `bigFiveResult_ID` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`studentAssessment_ID`),
  KEY `studentAccount_ID` (`studentAccount_ID`),
  KEY `riasecResult_ID` (`riasecResult_ID`),
  KEY `bigFiveResult_ID` (`bigFiveResult_ID`),
  CONSTRAINT `tbl_studentassessments_ibfk_1` FOREIGN KEY (`studentAccount_ID`) REFERENCES `tbl_studentaccounts` (`studentAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_2` FOREIGN KEY (`riasecResult_ID`) REFERENCES `tbl_riasecresults` (`riasecResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_3` FOREIGN KEY (`bigFiveResult_ID`) REFERENCES `tbl_bigfiveresults` (`bigFiveResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentassessments: ~12 rows (approximately)
INSERT INTO `tbl_studentassessments` (`studentAssessment_ID`, `studentAccount_ID`, `riasecResult_ID`, `bigFiveResult_ID`, `rating`, `feedback`, `date`) VALUES
	('05dced9d-7b38-492d-94ca-8efd8dcac8e7', 8, 4, 4, NULL, NULL, '2025-10-04 06:31:04'),
	('1dc2a9d2-bc45-4cf7-b6f1-9a57ab5b1ba5', 8, 14, 14, NULL, NULL, '2025-10-04 07:51:12'),
	('28b31700-8901-46b2-b398-811e95083dd3', 8, 10, 10, NULL, NULL, '2025-10-04 07:43:02'),
	('344133cb-a796-45d4-8454-e1598039142f', 8, 3, 3, NULL, NULL, '2025-10-04 06:09:57'),
	('4bbf0a39-74ba-4c87-ac1c-59ccb29f0f86', 8, 11, 11, NULL, NULL, '2025-10-04 07:48:42'),
	('6a04eb54-124c-4c54-b55f-4dc8502d2baa', 8, 8, 8, NULL, NULL, '2025-10-04 07:35:39'),
	('778a812e-7079-4e36-aed8-2920e8608688', 8, 9, 9, NULL, NULL, '2025-10-04 07:39:33'),
	('8cfe2fe1-1879-48ce-8fd4-978d0a2dd48f', 8, 12, 12, NULL, NULL, '2025-10-04 07:50:11'),
	('d918cb6b-d3da-4dcf-92f6-60c26295bc98', 8, 15, 15, NULL, NULL, '2025-10-04 07:53:52'),
	('e0a8424b-dbe0-4021-9418-2da141863805', 8, 7, 7, NULL, NULL, '2025-10-04 07:33:29'),
	('f5d2464f-e7ca-4094-9714-a8df381aa90c', 8, 5, 5, NULL, NULL, '2025-10-04 07:29:48'),
	('fcc71539-2404-4f95-96e6-88fe1068302d', 8, 2, 2, NULL, NULL, '2025-10-04 03:31:54');

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
