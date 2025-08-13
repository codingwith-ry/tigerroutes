import React from "react";
import { useNavigate } from "react-router-dom";

const Error404Page = () => {
  const navigate = useNavigate();

  const handleGoBackHome = () => {
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-[#FEFCE9] flex items-center justify-center px-4 font-sfpro relative">
      {/* Logo top-left */}
      <img
        src="/images/TIGER ROUTES.png"
        alt="TigerRoutes Logo"
        className="absolute top-5 left-6 h-8 cursor-pointer"
        onClick={() => navigate("/")}
      />

      <div className="w-full max-w-sm space-y-6">
        {/* Icon and Heading */}
        <div className="text-center text-sm mt-1">
          <img
            src="/3D Elements/Error.png"
            alt="Error 404"
            className="mx-auto w-60 h-60 mb-1"
          />
          <h1 className="text-3xl md:text-4xl font-medium leading-tight text-black tracking-tight">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Our sad tiger couldn't find what you're looking for.
          </p>
          <p className="text-sm text-gray-600">
            The page might have wandered off into the digital jungle.
          </p>
        </div>

        {/* Go Back Home Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGoBackHome}
            className="border border-yellow-400 text-yellow-400 py-3 px-6 rounded-full font-semibold hover:bg-yellow-400 hover:text-white transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error404Page;
