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
  `artistic` int NOT NULL DEFAULT (0),
  `extraversion` int NOT NULL DEFAULT (0),
  `agreeableness` int NOT NULL DEFAULT (0),
  `neuroticism` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`bigFiveResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_bigfiveresults: ~2 rows (approximately)
INSERT INTO `tbl_bigfiveresults` (`bigFiveResult_ID`, `openness`, `conscientiousness`, `artistic`, `extraversion`, `agreeableness`, `neuroticism`) VALUES
	(1, 57, 67, 0, 80, 50, 60),
	(2, 47, 47, 0, 57, 77, 73);

-- Dumping structure for table tigerroutesdb.tbl_counselornotes
CREATE TABLE IF NOT EXISTS `tbl_counselornotes` (
  `counselorNote_ID` int NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `staffAccount_ID` int NOT NULL,
  `counselorNotes` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`counselorNote_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `staffAccount_ID` (`staffAccount_ID`),
  CONSTRAINT `FK_tbl_counselornotes_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_counselornotes_ibfk_2` FOREIGN KEY (`staffAccount_ID`) REFERENCES `tbl_staffaccounts` (`staffAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_counselornotes: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_programs
CREATE TABLE IF NOT EXISTS `tbl_programs` (
  `program_ID` int NOT NULL AUTO_INCREMENT,
  `programName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `programDescription` text COLLATE utf8mb4_general_ci,
  `careerPaths` text COLLATE utf8mb4_general_ci,
  `programUSTlink` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`program_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_programs: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_recommendations
CREATE TABLE IF NOT EXISTS `tbl_recommendations` (
  `recommendation_ID` int NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` char(36) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `program_ID` int NOT NULL,
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
  `riasecResult_ID` int NOT NULL AUTO_INCREMENT,
  `realistic` int NOT NULL DEFAULT (0),
  `investigative` int NOT NULL DEFAULT (0),
  `artistic` int NOT NULL DEFAULT (0),
  `social` int NOT NULL DEFAULT (0),
  `enterprising` int NOT NULL DEFAULT (0),
  `conventional` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`riasecResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_riasecresults: ~2 rows (approximately)
INSERT INTO `tbl_riasecresults` (`riasecResult_ID`, `realistic`, `investigative`, `artistic`, `social`, `enterprising`, `conventional`) VALUES
	(1, 100, 100, 100, 100, 100, 100),
	(2, 100, 100, 100, 100, 100, 100);

-- Dumping structure for table tigerroutesdb.tbl_staffaccounts
CREATE TABLE IF NOT EXISTS `tbl_staffaccounts` (
  `staffAccount_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(128) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `staffRole_ID` int DEFAULT NULL,
  `staffProfile_ID` int DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`staffAccount_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffaccounts: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_strands
CREATE TABLE IF NOT EXISTS `tbl_strands` (
  `strand_ID` int NOT NULL AUTO_INCREMENT,
  `strandName` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`strand_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_strands: ~0 rows (approximately)
INSERT INTO `tbl_strands` (`strand_ID`, `strandName`) VALUES
	(7, 'STEM'),
	(8, 'ABM'),
	(9, 'HUMSS'),
	(10, 'Health-Allied');

-- Dumping structure for table tigerroutesdb.tbl_studentaccounts
CREATE TABLE IF NOT EXISTS `tbl_studentaccounts` (
  `studentAccount_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `email` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `password` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `studentProfile_ID` int DEFAULT NULL,
  PRIMARY KEY (`studentAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentaccounts: ~0 rows (approximately)
INSERT INTO `tbl_studentaccounts` (`studentAccount_ID`, `name`, `email`, `password`, `studentProfile_ID`) VALUES
	(8, 'RYAN REGULACION', 'ryan.regulacion.cics@ust.edu.ph', '', NULL);

-- Dumping structure for table tigerroutesdb.tbl_studentassessments
CREATE TABLE IF NOT EXISTS `tbl_studentassessments` (
  `studentAssessment_ID` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `studentAccount_ID` int NOT NULL,
  `riasecResult_ID` int NOT NULL,
  `bigFiveResult_ID` int NOT NULL,
  `rating` int DEFAULT NULL,
  `feedback` text COLLATE utf8mb4_general_ci,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentAssessment_ID`),
  KEY `studentAccount_ID` (`studentAccount_ID`),
  KEY `riasecResult_ID` (`riasecResult_ID`),
  KEY `bigFiveResult_ID` (`bigFiveResult_ID`),
  CONSTRAINT `tbl_studentassessments_ibfk_1` FOREIGN KEY (`studentAccount_ID`) REFERENCES `tbl_studentaccounts` (`studentAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_2` FOREIGN KEY (`riasecResult_ID`) REFERENCES `tbl_riasecresults` (`riasecResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_3` FOREIGN KEY (`bigFiveResult_ID`) REFERENCES `tbl_bigfiveresults` (`bigFiveResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentassessments: ~1 rows (approximately)
INSERT INTO `tbl_studentassessments` (`studentAssessment_ID`, `studentAccount_ID`, `riasecResult_ID`, `bigFiveResult_ID`, `rating`, `feedback`, `date`) VALUES
	('fcc71539-2404-4f95-96e6-88fe1068302d', 8, 2, 2, NULL, NULL, '2025-10-04 03:31:54');

-- Dumping structure for table tigerroutesdb.tbl_studentprofiles
CREATE TABLE IF NOT EXISTS `tbl_studentprofiles` (
  `studentProfile_ID` int NOT NULL AUTO_INCREMENT,
  `strand_ID` int NOT NULL,
  `gradeLevel` tinyint DEFAULT NULL,
  `studentGrades_ID` int DEFAULT NULL,
  PRIMARY KEY (`studentProfile_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentprofiles: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
