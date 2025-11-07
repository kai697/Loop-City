import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col justify-center items-center py-2 text-center">
      <svg width="160" height="40" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
        <text
          x="0"
          y="30"
          fontFamily="Georgia, 'Times New Roman', Times, serif"
          fontSize="32"
          fontWeight="600"
          fill="#E5E7EB"
          letterSpacing="-1.5"
        >
          loopcity
        </text>
      </svg>
      <p className="mt-2 text-sm text-gray-400">
        Micro-adventures for modern lives.
      </p>
    </header>
  );
};

export default Header;
