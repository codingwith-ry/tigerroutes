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

-- Data exporting was unselected.

-- Dumping structure for table tigerroutesdb.tbl_strands
CREATE TABLE IF NOT EXISTS `tbl_strands` (
  `strand_ID` int(11) NOT NULL AUTO_INCREMENT,
  `strandName` varchar(64) NOT NULL,
  PRIMARY KEY (`strand_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table tigerroutesdb.tbl_studentaccounts
CREATE TABLE IF NOT EXISTS `tbl_studentaccounts` (
  `studentAccount_ID` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL DEFAULT '',
  `email` varchar(128) NOT NULL DEFAULT '',
  `password` varchar(128) NOT NULL DEFAULT '',
  `studentProfile_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`studentAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table tigerroutesdb.tbl_studentprofiles
CREATE TABLE IF NOT EXISTS `tbl_studentprofiles` (
  `studentProfile_ID` int(11) NOT NULL AUTO_INCREMENT,
  `strand_ID` int(11) NOT NULL,
  `gradeLevel` tinyint(4) DEFAULT NULL,
  `studentGrades_ID` int(11) DEFAULT NULL,
  PRIMARY KEY (`studentProfile_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table tigerroutesdb.tbl_bigfiveresults
CREATE TABLE IF NOT EXISTS `tbl_bigfiveresults` (
  `bigFiveResult_ID` int(11) NOT NULL AUTO_INCREMENT,
  `openness` decimal(5,2) NOT NULL,
  `conscientiousness` decimal(5,2) NOT NULL,
  `artistic` decimal(5,2) NOT NULL,
  `extraversion` decimal(5,2) NOT NULL,
  `agreeableness` decimal(5,2) NOT NULL,
  `neuroticism` decimal(5,2) NOT NULL,
  PRIMARY KEY (`bigFiveResult_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_bigfiveresults: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_counselornotes
CREATE TABLE IF NOT EXISTS `tbl_counselornotes` (
  `counselorNote_ID` int(11) NOT NULL AUTO_INCREMENT,
  `studentAssessment_ID` int(11) NOT NULL,
  `staffAccount_ID` int(11) NOT NULL,
  `counselorNotes` text DEFAULT NULL,
  PRIMARY KEY (`counselorNote_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `staffAccount_ID` (`staffAccount_ID`),
  CONSTRAINT `tbl_counselornotes_ibfk_1` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
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
  `studentAssessment_ID` int(11) NOT NULL,
  `program_ID` int(11) NOT NULL,
  `alignmentScore` decimal(5,2) NOT NULL,
  PRIMARY KEY (`recommendation_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `program_ID` (`program_ID`),
  CONSTRAINT `tbl_recommendations_ibfk_1` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_recommendations_ibfk_2` FOREIGN KEY (`program_ID`) REFERENCES `tbl_programs` (`program_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_recommendations: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_riasecresults
CREATE TABLE IF NOT EXISTS `tbl_riasecresults` (
  `riasecResult_ID` int(11) NOT NULL AUTO_INCREMENT,
  `realistic` decimal(5,2) NOT NULL,
  `investigative` decimal(5,2) NOT NULL,
  `artistic` decimal(5,2) NOT NULL,
  `social` decimal(5,2) NOT NULL,
  `enterprising` decimal(5,2) NOT NULL,
  `conventional` decimal(5,2) NOT NULL,
  PRIMARY KEY (`riasecResult_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_riasecresults: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_studentassessments
CREATE TABLE IF NOT EXISTS `tbl_studentassessments` (
  `studentAssessment_ID` int(11) NOT NULL AUTO_INCREMENT,
  `studentAccount_ID` int(11) NOT NULL,
  `riasecResult_ID` int(11) NOT NULL,
  `bigFiveResult_ID` int(11) NOT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
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

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
