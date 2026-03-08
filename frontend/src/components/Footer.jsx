import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Villa97. All rights reserved.</p>
        <p>Luxury Villa Rentals Worldwide</p>
      </div>
    </footer>
  );
};

export default Footer;
