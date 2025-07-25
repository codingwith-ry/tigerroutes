import React from "react";
import { FaFacebookMessenger } from "react-icons/fa";

const FloatingChatButton = () => {
  return (
    <button className="fixed bottom-6 right-6 bg-yellow-400 p-4 rounded-full shadow-lg text-white text-2xl z-50">
      <FaFacebookMessenger />
    </button>
  );
};

export default FloatingChatButton;
