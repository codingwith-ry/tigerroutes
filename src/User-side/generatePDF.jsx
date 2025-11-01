import React from 'react';
import ReactDOM from 'react-dom/client';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProfilePage = ({ assessmentData }) => {
  const { assessmentID, assessmentProfile, riasec, bigFive } = assessmentData;
  
  return (
    <div className="bg-white p-8" style={{ width: '800px', minHeight: '1300px' }}> 
        <div className="grid grid-cols-2 gap-2">
            <div className="justify-self-start">
                <img 
                    src="/images/TIGER ROUTES.png" 
                    alt="TigerRoutes Logo" 
                    className="h-12" 
                />
            </div>
            <div className="justify-self-end text-right">
                <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">Assessment ID: {assessmentID}</p>
            </div>
        </div>
        <hr className="mt-2 mb-4" />

        <h1 className="text-2xl font-bold mb-8 text-center">Career Assessment Results</h1>

        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Student Profile</h2>
            <div className="grid grid-cols-2 gap-4">
                {/* Personal Information */}
                <div className="col-span-2 pb-2 border-b">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">Name:</p>
                            <p className="text-gray-700">{assessmentProfile?.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Email:</p>
                            <p className="text-gray-700">{assessmentProfile?.email}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Grade Level:</p>
                            <p className="text-gray-700">{assessmentProfile?.gradeLevel}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Strand:</p>
                            <p className="text-gray-700">{assessmentProfile?.strandName}</p>
                        </div>
                    </div>
                </div>

                {/* Academic Grades */}
                <div className="col-span-2 mt-1">
                    <h3 className="text-lg font-semibold mb-3">Academic Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="font-semibold">Mathematics:</p>
                            <p className="text-gray-700">{assessmentProfile?.mathGrade}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Science:</p>
                            <p className="text-gray-700">{assessmentProfile?.scienceGrade}</p>
                        </div>
                        <div>
                            <p className="font-semibold">English:</p>
                            <p className="text-gray-700">{assessmentProfile?.englishGrade}</p>
                        </div>
                        <div>
                            <p className="font-semibold">General Average:</p>
                            <p className="text-gray-700">{assessmentProfile?.genAverageGrade}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>




        <div className="grid grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-blue-600">RIASEC Profile</h2>
            {Object.entries(riasec || {}).map(([trait, value]) => (
                trait !== 'riasecResult_ID' && (
                <div key={trait} className="mb-3">
                    <div className="flex justify-between mb-1">
                    <span className="capitalize font-semibold">{trait}</span>
                    <span>{value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${value}%` }}
                    />
                    </div>
                </div>
                )
            ))}
        </div>

        <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-purple-600">Big Five Profile</h2>
            {Object.entries(bigFive || {}).map(([trait, value]) => (
                trait !== 'bigFiveResult_ID' && (
                <div key={trait} className="mb-3">
                    <div className="flex justify-between mb-1">
                    <span className="capitalize font-semibold">{trait}</span>
                    <span>{value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className="h-2 bg-purple-500 rounded-full mt-2"
                        style={{ width: `${value}%` }}
                    />
                    </div>
                </div>
                )
            ))}
            </div>
        </div>

      <div className="text-center text-sm text-gray-500 pt-2 mt-auto">
        <p>Page 1 of 3</p>
      </div>
    </div>
  );
};

const ProgramCard = ({ program, isTrackAligned }) => (
  <div className="p-4 border rounded-lg bg-gray-50 flex flex-col h-full">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {program.programDetails?.programName}
        </h3>
      </div>
      <span className={`text-sm font-bold ml-2 ${
        isTrackAligned ? 'text-green-600' : 'text-blue-600'
      }`}>
        {program.recommendation?.alignmentScore}%
      </span>
    </div>
    <span className={ `text-xs font-semibold text-center ${isTrackAligned ? 'bg-green-100 text-green-800' : 'bg-blue-500 text-white'} px-2 pb-3 rounded-full`}>{program.collegeDetails?.collegeName}</span>
    
    <div className="flex-1 space-y-3">
      <div>
        <p className="text-xs text-gray-700">
          {program.programDetails?.programDescription}
        </p>
      </div>
      
      <div className="text-xs">
        <p className="font-semibold mb-1">Career Opportunities:</p>
        <div className="flex flex-wrap gap-2 text-xs mt-3">
                    {program.programDetails?.careerPaths ? (
                        (() => {
                            try {
                                // Parse JSON if it's a string
                                const careers = typeof program.programDetails.careerPaths === 'string' 
                                    ? JSON.parse(program.programDetails.careerPaths) 
                                    : program.programDetails.careerPaths;
                                
                                // Handle array of career strings
                                if (Array.isArray(careers)) {
                                    return careers.slice(0, 4).map((career, careerIdx) => (
                                        <span 
                                            key={careerIdx}
                                            className={`${isTrackAligned ? 'bg-green-100 text-green-800' : 'bg-blue-500 text-white'} font-medium px-2 pb-3 rounded-full`}
                                        >
                                            {career}
                                        </span>
                                    ));
                                }
                            } catch (error) {
                                console.error('Error parsing careerPaths:', error);
                            }
                            
                            // Fallback
                            return (
                                <span className="bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full">
                                    {String(program.programDetails.careerPaths)}
                                </span>
                            );
                        })()
                    ) : (
                        // Fallback if no careerPaths data
                        <>
                            <span className={`${isTrackAligned ? 'bg-green-100 text-green-800' : 'bg-blue-500 text-white'}font-medium px-2 py-1 rounded-full`}>
                                Career data not available
                            </span>
                        </>
                    )}
                </div>
      </div>
    </div>
  </div>
);

const TrackAlignedPage = ({ programRecommendations }) => {
  return (
    <div className="bg-white p-8" style={{ width: '800px', minHeight: '1300px' }}>
      <h2 className="text-2xl font-bold mb-6">Track-Aligned Program Recommendations</h2>
      <div className="grid grid-cols-2 gap-4">
        {programRecommendations?.track_aligned?.map((program, idx) => (
          <ProgramCard key={idx} program={program} isTrackAligned={true} />
        ))}
      </div>
      <div className="text-center text-sm text-gray-500 pt-8 mt-auto">
        <p>Page 2 of 3</p>
      </div>
    </div>
  );
};

const CrossTrackPage = ({ programRecommendations }) => {
  return (
    <div className="bg-white p-8" style={{ width: '800px', minHeight: '1300px' }}>
      <h2 className="text-2xl font-bold mb-6">Cross-Track Program Recommendations</h2>
      <div className="grid grid-cols-2 gap-4">
        {programRecommendations?.cross_track?.map((program, idx) => (
          <ProgramCard key={idx} program={program} isTrackAligned={false} />
        ))}
      </div>
      <div className="text-center text-sm text-gray-500 pt-8 mt-auto">
        <p>Page 3 of 3</p>
        <p className="mt-2">Generated by TigerRoutes AI Career Navigator</p>
        <p>© {new Date().getFullYear()} TigerRoutes. All rights reserved.</p>
      </div>
    </div>
  );
};
// Updated PDF Generation Function
const generatePDF = async (assessmentData) => {
  try {
    const pdf = new jsPDF('p', 'pt', 'letter'); // 'l' for landscape
    const pages = [
      <ProfilePage assessmentData={assessmentData} />,
      <TrackAlignedPage programRecommendations={assessmentData.programRecommendations} />,
      <CrossTrackPage programRecommendations={assessmentData.programRecommendations} />
    ];

    // Generate each page
    for (let i = 0; i < pages.length; i++) {
      // Create container for current page
      const pageContainer = document.createElement('div');
      pageContainer.style.position = 'absolute';
      pageContainer.style.left = '-9999px';
      document.body.appendChild(pageContainer);

      // Render page content
      const root = ReactDOM.createRoot(pageContainer);
      root.render(pages[i]);

      // Wait for rendering and images
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate PDF page
      const canvas = await html2canvas(pageContainer.firstChild, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgWidth = 595; // A4 width in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Add page to PDF (first page doesn't need addPage)
      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Cleanup
      document.body.removeChild(pageContainer);
    }

    // Save the multi-page PDF
    pdf.save(`TigerRoutes_Assessment_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export default generatePDF;