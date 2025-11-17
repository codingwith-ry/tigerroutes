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

-- Dumping structure for table tigerroutesdb.tbl_assessmentprofiles
CREATE TABLE IF NOT EXISTS `tbl_assessmentprofiles` (
  `assessmentProfile_ID` int NOT NULL AUTO_INCREMENT,
  `mathGrade` double DEFAULT NULL,
  `scienceGrade` double DEFAULT NULL,
  `englishGrade` double DEFAULT NULL,
  `genAverageGrade` double DEFAULT NULL,
  `strand_ID` int DEFAULT NULL,
  `gradeLevel` tinyint DEFAULT NULL,
  PRIMARY KEY (`assessmentProfile_ID`) USING BTREE,
  KEY `FK_tbl_assessmentprofiles_tbl_strands` (`strand_ID`),
  CONSTRAINT `FK_tbl_assessmentprofiles_tbl_strands` FOREIGN KEY (`strand_ID`) REFERENCES `tbl_strands` (`strand_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_assessmentprofiles: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_bigfiveresults
CREATE TABLE IF NOT EXISTS `tbl_bigfiveresults` (
  `bigFiveResult_ID` int NOT NULL AUTO_INCREMENT,
  `openness` int NOT NULL DEFAULT (0),
  `conscientiousness` int NOT NULL DEFAULT (0),
  `extraversion` int NOT NULL DEFAULT (0),
  `agreeableness` int NOT NULL DEFAULT (0),
  `neuroticism` int NOT NULL DEFAULT (0),
  PRIMARY KEY (`bigFiveResult_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_bigfiveresults: ~0 rows (approximately)

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
  `date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`counselorNote_ID`),
  KEY `studentAssessment_ID` (`studentAssessment_ID`),
  KEY `staffAccount_ID` (`staffAccount_ID`),
  CONSTRAINT `FK_tbl_counselornotes_tbl_studentassessments` FOREIGN KEY (`studentAssessment_ID`) REFERENCES `tbl_studentassessments` (`studentAssessment_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_counselornotes_ibfk_2` FOREIGN KEY (`staffAccount_ID`) REFERENCES `tbl_staffaccounts` (`staffAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_counselornotes: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_pendingassessments
CREATE TABLE IF NOT EXISTS `tbl_pendingassessments` (
  `pendingAssessment_ID` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `studentAccount_ID` int NOT NULL,
  `assessmentProfile_ID` int DEFAULT NULL,
  `riasec_responses` json DEFAULT NULL,
  `bigfive_responses` json DEFAULT NULL,
  `riasec_progress` int DEFAULT '0',
  `bigfive_progress` int DEFAULT '0',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`pendingAssessment_ID`),
  KEY `studentAccount_ID` (`studentAccount_ID`),
  KEY `FK_pending_assessmentprofile` (`assessmentProfile_ID`),
  CONSTRAINT `FK_pending_assessmentprofile` FOREIGN KEY (`assessmentProfile_ID`) REFERENCES `tbl_assessmentprofiles` (`assessmentProfile_ID`) ON DELETE CASCADE,
  CONSTRAINT `FK_pending_student` FOREIGN KEY (`studentAccount_ID`) REFERENCES `tbl_studentaccounts` (`studentAccount_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_pendingassessments: ~0 rows (approximately)

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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_programs: ~39 rows (approximately)
INSERT INTO `tbl_programs` (`program_ID`, `collegeID`, `programName`, `programDescription`, `careerPaths`, `programUSTlink`) VALUES
	(15, 19, 'Bachelor of Science in Accountancy', 'Accounting professionals are involved in providing assurance and audit services for statutory financial reporting, tax-related services, management advisory services partnering in management decision-making, devising planning and performance and control systems, and providing expertise in financial reporting and control to assist various stakeholders in making decisions.', '["Staff Accountant", "Associate Auditor", "Junior Analyst", "Cost analyst"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-accountancy/'),
	(16, 19, 'Bachelor Science in Accounting Information System', 'Accounting information system professionals link operational activities, financial resource generation and consumption, value generation and preservation through a well-functioning information system.   They are expected to apply accounting, finance and computer skills in the context of the business, influencing the decisions, actions and behaviours of others and, thus, assisting and/or leading the organization at different levels. ', '["Accounting Analyst", "State Auditor", "Data Analyst", "Staff Accountant"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-accounting-information-system/'),
	(17, 19, 'Bachelor of Science in Management Accounting', 'Management accounting is a profession that involves partnering in management decision making, devising planning and performance management systems, and providing expertise in financial accounting and control to assist management in the formulation and implementation of an organization’s strategy.', '["Credit Analyst", "Cost Analyst", "Junior Analyst", "Cost Accountant"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-management-accounting/'),
	(18, 9, 'Bachelor of Science in Architecture', 'The Bachelor of Science in Architecture being offered is an enhanced five-year program designed to prepare its students to be glocal architects who will contribute to and influence in the improvement of the built environment. The sequence of the technical and professional courses has been structured to methodically develop the knowledge and skills of the students per year level. The pedagogy for the courses is now dynamic, with mentoring given focus in its delivery. To ensure intensive stimulation of student creativity and skill, the Faculty-Student ratio for the Design and Building Technology courses is now 1:23. The Architecture Midterm Aptitude Comprehensive Examination and the Architecture Review Course given to 3rd and 5th year students, respectively, validates the knowledge gained by the students about the program. Linkages with foreign universities and organizations provides opportunities for the students for international exposure. In their final year, students harvest all their learnings and showcase everything through their thesis project.', '["CADD Operator", "Project Coordinator", "Scale Modeling", "Architectural Drafting"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-architecture/'),
	(19, 1, 'Bachelor of Arts in Behavioral Science', 'The Bachelor of Arts in Behavioral Science (BES) program combines psychology, management, and sociology, with emphasis on human resource management. ', '["HR Manager", "Organization Analyst", "Employee Relations Specialist", "Training Manager"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-arts-in-behavioral-science/'),
	(20, 1, 'Bachelor of Arts in Political Science', 'The undergraduate program in Political Science provides its students with excellent training in the discipline through instruction, research, and internship. The new curriculum was the result of the series of consultations with the faculty, students, alumni, and industry in 2017. The courses are concentrated on five (5) primary fields: 1) Philippine government and politics; 2) Comparative politics; 3) International relations; 4) Political theory; and 5) Public administration. ', '["Law", "Pulic Service", "Civil Service", "Public Relations"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-arts-in-political-science/'),
	(21, 1, 'Bachelor of Arts in Economics', 'The program is designed to equip students with knowledge in economic theory and its application and with essential skills for undertaking economic analysis. Intended to provide students with a more liberal education, the BA program requires fewer major (Economics) courses but more liberal arts, such as those in humanities, other social sciences, and foreign languages. The BA curriculum is more flexible, giving students leeway to customize their program of study according to their personal goals and interests. ', '["Management Trainee", "Credit and Collections Staff", "Commodity Analyst", "Financial Analyst"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-arts-in-economics/'),
	(22, 10, 'Bachelor of Science in Entrepreneurship', 'The BS Entrepreneurship program is primarily designed to provide training to would-be entrepreneurs in the nuances of starting and operating a business as well as building one’s character. The program commits itself to the education and formation of students who will be competent, committed, and compassionate entrepreneurs imbued with ethical, pro-social, and altruistic qualities of empathy, social responsibility, and justice.', '["Marketing Assistant", "Corporate Planning Assistant"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-entrepreneurship/'),
	(23, 10, 'Bachelor of Science in Business Administration, major in Marketing Management', 'The Bachelor of Science in Business Administration, major in Marketing Management program produces well-rounded, globally competitive graduates equipped with the knowledge to cover specific areas in marketing, such as marketing research, distribution management, product management, brand management, personal selling, pricing management, and Internet management in order to meet the needs of the changing environment in the business world.', '["Sales Associate", "Marketing Analyst", "Product/Brand Assistant", "Marketing Manager"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-business-administration-major-in-marketing-management/'),
	(24, 10, 'Bachelor of Science in Business Administration, major in Financial Management', 'Bachelor of Science in Business Administration, Major in Financial Management is a four-year degree program that provides students with a strong foundation on theories, principles, and concepts that equip them with relevant technical and analytical skills necessary in financial decision-making, cognizant of a dynamic domestic and global business environments, and mindful of their role in nation-building. The students’ terminal outputs are research undertakings that are geared toward both application of learned concepts and/or theory development.', '["Financial Analyst", "Investment Researcher", "Equity Analyst", "Fund Manager"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-business-administration-major-in-financial-management/'),
	(25, 11, 'Bachelor of Elementary Education', 'Bachelor of Elementary Education (BEEd) is a four-year program that provides academic and appropriate training for future elementary school teachers of Grades 1 – 6 through the general education courses, professional education, and specialization courses. The program culminates with an extensive teaching internship in various cooperating schools, both public and private, local and international, under the mentorship of highly experienced professional teachers. ', '["Primary Teacher", "Intermediate Teacher", "Educational Researcher", "School Director"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-elementary-education/'),
	(26, 11, 'Bachelor of Secondary Education', 'Bachelor of Secondary Education (BSEd) is a four-year program that prepares its students for the art and science of teaching. It builds know-how in pedagogy, such as foundations of education, principles of teaching, facilitating learning, curriculum development, child and adolescent psychology, assessment of student learning, educational technology and instructional materials preparation, and classroom management, among others, as well as would-be teachers’ disciplinal expertise. The areas of specialization offered by the program are: Science, English, Filipino, Mathematics, Religious and Values Education, and Social Studies. The program culminates with an intensive one-year practice teaching in the laboratory school of the College and in the cooperating public and private (local and international) schools, where student teachers receive active mentoring from highly-experienced professional teachers. ', '["Grade School Teacher", "Junior High School Teacher", "Researcher", "Coach"]', 'https://www.ust.edu.ph/education/'),
	(27, 11, 'Bachelor of Science in Food Technology', 'Bachelor of Science in Food Technology (BSFT) is a four-year program that integrates the disciplines of the chemistry, biology, and engineering in the innovation and processing of safe, stable, palatable, and nutritious food in order to address growing global food security concerns. The program also provides opportunities to gain managerial and entrepreneurial skills essential for a successful food business. ', '["Production Manager", "Product Development Specialist", "Sensory Analyst", "Food Quality Assurance Officer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-food-technology/'),
	(28, 3, 'Bachelor of Science in Chemical Engineering', 'Bachelor of Science in Chemical Engineering alumni from the University of Santo Tomas shall be engaged either locally or abroad in design, operation, or management of an industrial plant; or  pursue teaching, research, technical sales, or entrepreneurship after having completed advanced studies or special training. Furthermore, they shall be expected to imbibe the Thomasian traits of contemplative, creative, and critical thinking; exemplary work ethic; and a commitment to the improvement of society and lifelong learning. ', '["Waste Management Expert", "Product Development Engineer", "Quality Control Engineer", "Safety, Health, and Environment Officer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-chemical-engineering/'),
	(29, 3, 'Bachelor of Science in Civil Engineering', 'The Bachelor of Science in Civil Engineering (CE) Program enables aspiring engineers to develop thinking, collaborative, and technical skills for solving complex civil engineering problems and to learn how to assimilate new knowledge needed for the design, construction, and maintenance of roads, bridges, buildings, water supply, irrigation, flood control, ports, and other infrastructure while considering impact in various contexts. The UST CE Program prepares individuals to engage in any field of civil engineering and, moreover, educates them in any of these specialized fields: Construction and Management Engineering, Geotechnical Engineering, Structural Engineering, Transportation Engineering, and Water Resources Engineering. All graduates imbibe the Thomasian Graduate Attributes that warrant their productivity and ethical participation in society and nation-building through academe, research, and industry practice. ', '["Geotechnical Engineer", "Environmental Engineer", "Structural / Design Engineer", "Construction Manager / Engineer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-civil-engineering/'),
	(30, 3, 'Bachelor of Science in Electrical Engineering', 'The Bachelor of Science in Electronics Engineering Program (BS ECE) of the University of Santo Tomas provides a curriculum that allows the students to have wide and deep knowledge in various fields of the Electronics Engineering discipline. The program develops undergraduate students by enabling them to contribute to technological advancement through research and innovation. The UST BS ECE Program offers three (3) specialization tracks, namely: Communications, Microelectronics, and Instrumentation and Control. The Communications track specializes in the area of network design and efficient wireless transmission of multimedia information, while the Microelectronics track specializes in the development of sensors, micro-electromechanical systems (MEMS), and VLSI devices. Finally, the Instrumentation track specializes in the area of Artificial Intelligence, Robotics, and Industrial Automation. ', '["Telecommunications Engineer", "Computer Network Engineer", "Biomedical Engineer", "Broadcast Engineer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-electronics-engineering/'),
	(31, 12, 'Bachelor of Fine Arts, major in Advertising Arts', 'The Advertising Arts major provides the foundation of both the visual design and marketing aspects of advertising. The discipline introduces the student to both aesthetics and promotion in the form of commercial art. In Advertising Arts, students learn not only drawing and rendering skills; but are also developed in the business side of advertising. Moreover, the program also offers elective courses that provide an overview of allied areas in the discipline, such as illustration, fashion design, package design, merchandising, corporate identity, digital arts, animation, and photography. Like any other UST program offering, design development projects in the said program discipline are research-based to support the goal of the college to produce not only talented Thomasian artists but also competent and highly qualified Advertising Arts Practitioners.', '["Creative Director", "Media Planner", "Advertising Manager", "Ad Agency Account Executive"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-fine-arts-major-in-advertising-arts/'),
	(32, 12, 'Bachelor of Fine Arts, major in Industrial Design', 'Industrial Design major is an integration of art and technology. It prepares students for a professional career in product design, specializing in the development of manufactured objects and systems design. The program is geared toward generating designers who create innovative, sensible, sustainable, aesthetically suitable, and socially relevant products. ', '["Product Designer", "Design Associate", "Furniture Engineer", "Toys and Games Designer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-fine-arts-major-in-industrial-design/'),
	(33, 12, 'Bachelor of Science in Interior Design', 'Interior Design is the act of planning, designing, specifying, and giving general administration and responsible direction to the functional, orderly and aesthetic arrangements and development of materials of buildings and residences. Bachelor of Science in Interior Design is designed to develop foundational skills to prepare the student for the job. The program focuses on studio and academic research in history, theory and methods as they relate to interdisciplinary approach to interior design.', '["Interior Design Researcher", "Furniture Designer", "Accessories Designer", "Exhibition Designer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-interior-design/'),
	(34, 18, 'Bachelor of Science in Computer Science', 'Bachelor of Science in Computer Science (BSCS) is a four-year program that includes the study of computing concepts and theories, algorithmic foundations, and new developments in computing. The program prepares its students to design and create algorithmically complex software and develop new and effective algorithms for solving computing problems.', '["Software Engineer", "Applications Software Developer", "Data Analyst", "Systems Analyst"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-computer-science/'),
	(35, 18, 'Bachelor of Science in Information Systems', 'The BS Information Systems program integrates business processes with information technology. Starting Academic Year 2018-2019, the program offers two professional elective tracks: Business Analytics (covering six areas including Fundamentals of Business Analytics, Enterprise Data Management, Analytics Modelling, Analytics Techniques and Tools, Analytics Application, and Analytics Internship with industry immersion) and Service Management (designed to prepare students for careers in the IT-BPO industry with competencies for entry-level positions and career development). Students learn systems analysis, database management, enterprise architecture, and business analytics to become IT professionals who bridge business and technology.', '["Systems Analyst", "Project Leader", "Database Administrator", "Programmer"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-information-systems/'),
	(36, 18, 'Bachelor of Science in Information Technology', 'The BS Information Technology program focuses on the practical application of technology in business and organizational settings. Starting Academic Year 2018-2019, the program offers three professional elective tracks: Network and Security (focusing on CCNA modules, network management, and security policy implementation), Web and Mobile App Development (covering PHP, .NET Framework, Android, iOS, and Windows mobile platforms), and IT Automation (emphasizing hardware integration and Internet of Things applications using technologies like Arduino and Boe-Bot). Students gain expertise in network administration, web development, system maintenance, and emerging technologies.', '["Computer Engineer", "Network Administrator", "Programmer", "Project Leader"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-information-technology/'),
	(37, 4, 'Bachelor of Science in Basic Human Studies', 'This program is an innovative bachelor’s degree that serves as a preparatory program for the degree of Doctor of Medicine of the UST Faculty of Medicine and Surgery. An alternative name for the program is Learning-Enhanced Accelerated Program for Medicine (LEAPMed). In terms of course content, the program is more focused on human sciences than any existing premedical courses. At the end of two years and two special terms, the student will exhibit proficiency in basic human sciences and exemplify readiness to pursue medical studies.  Students will graduate with the degree of Bachelor of Science in Basic Human Studies (BSBHS) and will be eligible for admission to Medicine Proper at the UST Faculty of Medicine and Surgery. ', '["Clinical Researcher", "Laboratory Assistant", "Physician Associate", "Secondary Education Teacher"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-basic-human-studies/'),
	(38, 17, 'Bachelor of Music in Music Education', 'Bachelor of Music in Music Education prepares a student for a job as Music teacher in Basic Education. Aside from the philosophies and foundations of Education, and strategies used inside the classroom as music teacher, the student is also trained in an instrument of his/her choice as emphasis/major.', '["Music Teacher", "Cultural Worker", "Researcher"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-music-in-music-education/'),
	(39, 17, 'Bachelor of Music in Music Technology', 'Bachelor of Music in Music Technology is a creative-track course with a strong technology background that introduces the used of computer and music applications in producing music output. The compositional requirement focuses on media and popular music that can be used for television, film, gaming applications, and multi-media. Songwriting is also an area where the student is given training.', '["Media Musician", "Sound Designer", "Sound Effects Specialist", "Music Director"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-music-in-music-technology/'),
	(40, 17, 'Bachelor of Music in Music Theatre', 'Bachelor of Music in Music Theater trains a student to become a performer for musicals of the Broadway genre, Filipino Sarswela and the likes. Students are given training on basic classical, Broadway and jazz style techniques. Dance is an integral part of the program, as well as acting and directing stage musicals.', '["Ensemble Performer", "Music Theater Actor", "Music Theater Director"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-music-in-music-theatre/'),
	(41, 13, 'Bachelor of Science in Nursing', 'The BSN Program aims to develop a professional nurse who is able to assume entry-level positions in health facilities or community settings. The professional nurse is capable of providing safe, humane, quality, and holistic care to individuals in varying age, gender, and health-illness status; healthy or at-risk families; population groups; and community; singly or in collaboration with other health care providers, to promote health, prevent illness, restore health, alleviate suffering, and provide end-of-life care.', '["Professional Nurse"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-nursing/'),
	(42, 5, 'Bachelor of Science in Biochemistry', 'Biochemistry is the branch of science concerned with the chemistry of biomolecules (proteins, carbohydrates, lipids and nucleic acids) and chemical processes of life. It is multidisciplinary, standing at the crossroads between the physical sciences (chemistry and physics) and the life sciences (botany, zoology, microbiology, and genetics). The BS Biochemistry program offers students the understanding of the structure and function of biomolecules, studying the way these molecules are organized, and the interactions that take place among them in order to maintain life processes.', '["Doctor of Medicine", "Academic Professor", "Research Institution Scientist", "Forensic Expert"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-biochemistry/'),
	(43, 5, 'Bachelor of Science in Medical Technology', 'Bachelor of Science in Medical Technology is a four-year program consisting of general education and professional courses. The fourth-year level is the one-year internship program in a Commission on Higher Education (CHED)-accredited training laboratory, with rotational duties in different sections, such as Clinical Chemistry, Hematology, Microbiology, Immunohematology (Blood Banking), Immunology and Serology, Urinalysis and other Body Fluids (Clinical Microscopy), Parasitology, Histopathologic/Cytological Techniques, and other emergent technologies. ', '["Medical Technologist", "Diagnostic Molecular Scientist", "Research Scientist", "Laboratory Manager"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-medical-technology/'),
	(44, 5, 'Bachelor of Science in Pharmacy', 'Bachelor of Science in Pharmacy is a four-year degree program that equips students with the knowledge and skills necessary for a career in the pharmaceutical field. This comprehensive program encompasses a wide range of coursework and experiential learning to prepare graduates for various roles within the healthcare and pharmaceutical industries. The curriculum of the Bachelor of Science in Pharmacy program is designed to provide students with a solid foundation in pharmaceutical chemistry, practice of pharmacy, pharmaceutics, pharmaceutical sciences, social and administrative pharmacy, and research. Students are exposed to both theoretical and practical aspects of pharmacy, including laboratory work and internship experiences in pharmacy settings. These hands-on experiences allow students to apply their knowledge in real-world situations and develop the skills needed to work effectively as a member of healthcare team. Furthermore, the program emphasizes ethics, patient safety, and regulatory compliance to ensure graduates are well-prepared to uphold the highest standards in pharmaceutical practice. The program aims to produce compassionate Thomasian pharmacists who are morally and scientifically competent and committed to their patients’ health and well-being.', '["Pharmaceutical Manufacturing", "Production Planning and Inventory Control", "Clinical Pharmacy", "Research and Development"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-pharmacy/'),
	(45, 20, 'Bachelor of Science in Fitness and Sports Management', 'Bachelor of Science in Fitness and Sports Management is a four-year program designed to provide graduates with a broad and coherent understanding of applied exercise and sports sciences in terms of fitness and sports coaching and the management of fitness and sports programs in various industry settings. This program allows maximum opportunity for students to pursue various combinations of courses in coaching, programming, and administration within their particular areas of interest.', '["Fitness and Recreation Manager", "Sports Tourism Officer", "Sports, Fitness, and Wellness Facilities Manager", "Sports Brand Manager"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-fitness-and-sports-management/'),
	(46, 14, 'Bachelor of Science in Occupational Therapy', 'Bachelor of Science in Occupational Therapy is a four-year program that produces client-centered health professionals who are concerned with promoting health and well-being, with the primary goal of engaging individuals and population in occupation to facilitate participation in culturally meaningful activities and tasks, and address physical, developmental, social, or emotional problems.  The program culminates in a one-year internship program that allows students to work hand in hand with clients of all ages, to increase the latter’s independence, enhance development, and/or prevent disability through their involvement in activities that are therapeutically designed to promote occupational performance. They also work with different communities and organizations to enable a just and inclusive society for all, in order to facilitate the realization of one’s potential in leading an independent, productive, and satisfying life. ', '["Occupational Therapy Consultant", "Clinical Educator"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-occupational-therapy/'),
	(47, 14, 'Bachelor of Science in Physical Therapy', 'Bachelor of Science in Physical Therapy is a four-year program that produces professionals who promote optimal health and function by providing services that develop, maintain, and restore maximum movement and functional ability, for people at any stage of life, when their movement and function are threatened by ageing, injury, diseases, disorders, conditions, or environmental factors. The program culminates in a one-year comprehensive internship program that allows students to work within the health spheres of promotion, prevention, treatment/intervention, habilitation, and rehabilitation, supervised by licensed professionals.', '["Physical Therapy Clinician", "Educator", "Researcher", "Consultant"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-physical-therapy/'),
	(48, 14, 'Bachelor of Science in Sports Science', 'Sports Science is an interdisciplinary field designed to provide graduates with a broad and coherent understanding of applied exercise and sports sciences in terms of fitness and sports coaching, and the management of fitness and sports programs in various industry settings. The fitness and sports coaching major is part of a standalone degree, but it enhances and complements the coaching licensure and/or certification accredited by relevant international and national governing sports bodies, as well as fitness-related certifications by reputable organizations in the field. This knowledge and skills base allows graduates to address the relevant needs of employers and pursue further specialization studies. ', '["Strength and Conditioning Specialist", "Exercise and Sport Specialist", "Fitness and Sports Program Specialist", "Corporate and Commercial Fitness Practitioners"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-sports-science/'),
	(49, 15, 'Bachelor of Science in Microbiology', 'Bachelor of Science in Microbiology is a four-year program that provides its students the opportunity to study the various microorganisms, like viruses, bacteria, algae, protozoan, and fungi, and their activities. The Microbiology program emphasizes the sciences of biology, chemistry, genetics, and mathematics, which are essential to the study of microbiology. In the University of Santo Tomas, the study of microorganisms is done through an inquiry-based and discovery learning process. A degree in microbiology prepares students for graduate-level study, for employment in microbiological and allied fields (e.g., food and beverage industries, health sciences, and environmental sciences), or for medical school.', '["Microbiologist Scientist", "Medical Product Specialist", "Clinical Research Associate", "Healthcare scientist"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-microbiology/'),
	(50, 15, 'Bachelor of Science in Chemistry', 'Bachelor of Science in Chemistry (BSChem) is a four-year program that aims to produce graduates who comply with the current qualification requirements of professional chemists for local and overseas employment and entrepreneurship. The program aims at building a strong analytical and technical background for employment in a variety of fields. ', '["Laboratory Chemist", "Forensic Chemist", "Research Chemist", "Academic Staff Member"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-chemistry/'),
	(51, 15, 'Bachelor of Science in Psychology', 'The Bachelor of Science in Psychology program is designed to provide students with a Biopsychosocial Model in the study human behavior. This holistic approach gives students the unique perspective of analyzing, interpreting, and exploring the dynamics of human behavior by utilizing concepts in the areas of biology (neuro-anatomy), psychology, and sociology. The Department of Psychology provides a progressive curriculum and research program that offer students the distinct, innovative, and dynamic  opportunity to excel in the practice of psychology, particularly in industrial, educational, and clinical settings.', '["Psychometrician", "Teacher"]', 'https://www.ust.edu.ph/academics/programs/bachelor-of-science-in-psychology/'),
	(52, 16, 'Bachelor of Science in Hospitality Management', 'Bachelor of Science in Hospitality Management prepares graduates to become global leaders and managers for major hospitality industry segments by developing strategies that can be applied at the workplace from running world-class front to back of the house operations, building guest relations, managing financial transactions, creating marketing opportunities to cultivating business ventures. The program aims to achieve its goals and objectives through dynamic academic and research projects and activities geared toward quality life, business success, collaborations, partnerships, creative approaches and conduct of ethical practices. The BS in Hospitality Management program has two areas of specialization: (1) Major in Culinary Entrepreneurship and (2) Major in Hospitality Leadership.', '["Housekeeping Manager", "Resort Hotel Manager", "Baker/Pastry Check", "Head Cook"]', 'https://www.ust.edu.ph/tourism-and-hospitality-management/'),
	(53, 16, 'Bachelor of Science in Tourism Management', 'Bachelor of Science in Tourism Management is a four-year degree program related to the fields of hospitality and tourism education. It provides students the opportunity to become involved directly in managing and planning the world’s biggest people industry – tourism. This concentrates on courses such as history, travel, language, and other cultural aspects. It provides exposure and training of becoming experts in management of the travel, tour, and hospitality industry and will lead students to a journey toward a senior role in this exciting, diverse, and growing industry. The BS Tourism Management program has two areas of specialization: (1) Major in Travel Operations and Service Management, and (2) Major in Recreation and Leisure Management.', '["Park Management Specialist", "Recreation Specialist", "Flight Attendant", "Manager of Travel Literature"]', 'https://www.ust.edu.ph/tourism-and-hospitality-management/');

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
) ENGINE=InnoDB AUTO_INCREMENT=249 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_riasecresults: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_staffaccounts
CREATE TABLE IF NOT EXISTS `tbl_staffaccounts` (
  `staffAccount_ID` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `staffRole_ID` int DEFAULT NULL,
  `staffProfile_ID` int DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`staffAccount_ID`),
  KEY `FK_tbl_staffaccounts_tbl_staffroles` (`staffRole_ID`),
  KEY `FK_tbl_staffaccounts_tbl_staffprofiles` (`staffProfile_ID`),
  CONSTRAINT `FK_tbl_staffaccounts_tbl_staffprofiles` FOREIGN KEY (`staffProfile_ID`) REFERENCES `tbl_staffprofiles` (`staffProfile_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_tbl_staffaccounts_tbl_staffroles` FOREIGN KEY (`staffRole_ID`) REFERENCES `tbl_staffroles` (`staffRole_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffaccounts: ~0 rows (approximately)
INSERT INTO `tbl_staffaccounts` (`staffAccount_ID`, `name`, `email`, `password`, `staffRole_ID`, `staffProfile_ID`, `status`) VALUES
	(1, 'Owen Trinidad', 'michaelowen.trinidad.cics@ust.edu.ph', 'hello123', 2, NULL, NULL),
	(2, 'Mr. Phil Pines', 'philippines@ust.edu.ph', 'U_uX1D', 1, 1, 1);

-- Dumping structure for table tigerroutesdb.tbl_stafflogs
CREATE TABLE IF NOT EXISTS `tbl_stafflogs` (
  `staffLogs_ID` int NOT NULL AUTO_INCREMENT,
  `staffAccount_ID` int DEFAULT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  PRIMARY KEY (`staffLogs_ID`),
  KEY `FK_tbl_stafflogs_tbl_staffaccounts` (`staffAccount_ID`),
  CONSTRAINT `FK_tbl_stafflogs_tbl_staffaccounts` FOREIGN KEY (`staffAccount_ID`) REFERENCES `tbl_staffaccounts` (`staffAccount_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_stafflogs: ~10 rows (approximately)
INSERT INTO `tbl_stafflogs` (`staffLogs_ID`, `staffAccount_ID`, `action`, `date`) VALUES
	(1, 1, 'Delete counselor note (noteId:4) from assessment id:12ea4f4b-b336-4e23-ad32-935b9a38d503 - "Thanks! You may reach the TigerRoutes support email for further details."', '2025-11-06 01:06:10'),
	(2, 1, 'Create counselor note for assessment id:12ea4f4b-b336-4e23-ad32-935b9a38d503 (noteId:5) - "Nice!"', '2025-11-06 01:06:21'),
	(3, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-11 16:33:22'),
	(4, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-11 16:57:36'),
	(5, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-12 01:57:11'),
	(6, 1, 'Create counselor Mr. Phil Pines (id:2)', '2025-11-12 02:10:03'),
	(7, 1, 'Create counselor note for assessment id:66a1f89a-d6fb-4471-bec0-a3484bd8f843 (noteId:6) - "good job"', '2025-11-12 02:15:39'),
	(8, 1, 'Create counselor note for assessment id:66a1f89a-d6fb-4471-bec0-a3484bd8f843 (noteId:7) - "test"', '2025-11-12 02:20:56'),
	(9, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-12 07:43:55'),
	(10, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-15 08:13:33'),
	(11, 1, 'Staff login: michaelowen.trinidad.cics@ust.edu.ph (ID:1)', '2025-11-15 08:39:32');

-- Dumping structure for table tigerroutesdb.tbl_staffprofiles
CREATE TABLE IF NOT EXISTS `tbl_staffprofiles` (
  `staffProfile_ID` int NOT NULL AUTO_INCREMENT,
  `strand_ID` int DEFAULT NULL,
  `officeDetails` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `about` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `consultationDetails` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`staffProfile_ID`),
  KEY `FK_tbl_staffprofiles_tbl_strands` (`strand_ID`),
  CONSTRAINT `FK_tbl_staffprofiles_tbl_strands` FOREIGN KEY (`strand_ID`) REFERENCES `tbl_strands` (`strand_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffprofiles: ~0 rows (approximately)
INSERT INTO `tbl_staffprofiles` (`staffProfile_ID`, `strand_ID`, `officeDetails`, `about`, `consultationDetails`) VALUES
	(1, 7, 'Room 204', 'bayang magiliw', 'Mon & Wed');

-- Dumping structure for table tigerroutesdb.tbl_staffroles
CREATE TABLE IF NOT EXISTS `tbl_staffroles` (
  `staffRole_ID` int NOT NULL AUTO_INCREMENT,
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`staffRole_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_staffroles: ~2 rows (approximately)
INSERT INTO `tbl_staffroles` (`staffRole_ID`, `role`) VALUES
	(1, 'counselor'),
	(2, 'supervisor');

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
  PRIMARY KEY (`studentAccount_ID`),
  KEY `FK_tbl_studentaccounts_tbl_studentprofiles` (`studentProfile_ID`),
  CONSTRAINT `FK_tbl_studentaccounts_tbl_studentprofiles` FOREIGN KEY (`studentProfile_ID`) REFERENCES `tbl_studentprofiles` (`studentProfile_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentaccounts: ~1 rows (approximately)
INSERT INTO `tbl_studentaccounts` (`studentAccount_ID`, `name`, `email`, `password`, `studentProfile_ID`) VALUES
	(10, 'RYAN REGULACION', 'ryan.regulacion.cics@ust.edu.ph', '', 3);

-- Dumping structure for table tigerroutesdb.tbl_studentassessments
CREATE TABLE IF NOT EXISTS `tbl_studentassessments` (
  `studentAssessment_ID` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `studentAccount_ID` int NOT NULL,
  `assessmentProfile_ID` int DEFAULT NULL,
  `riasecResult_ID` int NOT NULL,
  `bigFiveResult_ID` int NOT NULL,
  `rating` int DEFAULT NULL,
  `feedback` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`studentAssessment_ID`),
  KEY `studentAccount_ID` (`studentAccount_ID`),
  KEY `riasecResult_ID` (`riasecResult_ID`),
  KEY `bigFiveResult_ID` (`bigFiveResult_ID`),
  KEY `FK_tbl_studentassessments_tbl_assessmentprofiles` (`assessmentProfile_ID`),
  CONSTRAINT `FK_tbl_studentassessments_tbl_assessmentprofiles` FOREIGN KEY (`assessmentProfile_ID`) REFERENCES `tbl_assessmentprofiles` (`assessmentProfile_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_1` FOREIGN KEY (`studentAccount_ID`) REFERENCES `tbl_studentaccounts` (`studentAccount_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_2` FOREIGN KEY (`riasecResult_ID`) REFERENCES `tbl_riasecresults` (`riasecResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `tbl_studentassessments_ibfk_3` FOREIGN KEY (`bigFiveResult_ID`) REFERENCES `tbl_bigfiveresults` (`bigFiveResult_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentassessments: ~0 rows (approximately)

-- Dumping structure for table tigerroutesdb.tbl_studentgrades
CREATE TABLE IF NOT EXISTS `tbl_studentgrades` (
  `studentGrades_ID` int NOT NULL AUTO_INCREMENT,
  `mathGrade` double DEFAULT NULL,
  `scienceGrade` double DEFAULT NULL,
  `englishGrade` double DEFAULT NULL,
  `genAverageGrade` double DEFAULT NULL,
  PRIMARY KEY (`studentGrades_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentgrades: ~2 rows (approximately)
INSERT INTO `tbl_studentgrades` (`studentGrades_ID`, `mathGrade`, `scienceGrade`, `englishGrade`, `genAverageGrade`) VALUES
	(2, 90, 94, 97, 94),
	(3, 90, 88, 92, 91);

-- Dumping structure for table tigerroutesdb.tbl_studentprofiles
CREATE TABLE IF NOT EXISTS `tbl_studentprofiles` (
  `studentProfile_ID` int NOT NULL AUTO_INCREMENT,
  `strand_ID` int NOT NULL,
  `gradeLevel` tinyint DEFAULT NULL,
  `studentGrades_ID` int DEFAULT NULL,
  PRIMARY KEY (`studentProfile_ID`),
  KEY `FK_tbl_studentprofiles_tbl_studentgrades` (`studentGrades_ID`),
  KEY `FK_tbl_studentprofiles_tbl_strands` (`strand_ID`),
  CONSTRAINT `FK_tbl_studentprofiles_tbl_strands` FOREIGN KEY (`strand_ID`) REFERENCES `tbl_strands` (`strand_ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_tbl_studentprofiles_tbl_studentgrades` FOREIGN KEY (`studentGrades_ID`) REFERENCES `tbl_studentgrades` (`studentGrades_ID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table tigerroutesdb.tbl_studentprofiles: ~2 rows (approximately)
INSERT INTO `tbl_studentprofiles` (`studentProfile_ID`, `strand_ID`, `gradeLevel`, `studentGrades_ID`) VALUES
	(2, 7, 12, 2),
	(3, 7, 12, 3);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
