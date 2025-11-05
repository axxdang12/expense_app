import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-background shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold text-text-primary text-center">
          Trình quản lý chi tiêu
        </h1>
      </div>
    </header>
  );
};

export default Header;
