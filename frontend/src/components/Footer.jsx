import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="bg-bakery-dark text-light pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <div className="rounded-circle p-2 me-2 bg-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-cake2-fill fs-4 text-bakery-accent"></i>
              </div>
              <span className="fw-bold font-serif fs-4 text-white">SweetDelight</span>
            </div>
            <p className="text-light text-opacity-75 small mb-3">
              Handcrafting moments of happiness with 100% natural butter, pure Belgian chocolate, fresh fruits, and artisanal care since 2018.
            </p>
            <div className="d-flex gap-2">
              <a href="#instagram" className="btn btn-outline-light btn-sm rounded-circle p-2" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#facebook" className="btn btn-outline-light btn-sm rounded-circle p-2" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#whatsapp" className="btn btn-outline-light btn-sm rounded-circle p-2" aria-label="WhatsApp">
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-bakery-gold fw-bold text-uppercase mb-3 font-serif">Categories</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              <li><Link to="/products?category=Birthday+Cake" className="text-light text-opacity-75 text-decoration-none hover-white">Birthday Cakes</Link></li>
              <li><Link to="/products?category=Chocolate+Cake" className="text-light text-opacity-75 text-decoration-none hover-white">Chocolate Cakes</Link></li>
              <li><Link to="/products?category=Red+Velvet+Cake" className="text-light text-opacity-75 text-decoration-none hover-white">Red Velvet</Link></li>
              <li><Link to="/products?category=Black+Forest+Cake" className="text-light text-opacity-75 text-decoration-none hover-white">Black Forest</Link></li>
              <li><Link to="/products?category=Cupcake" className="text-light text-opacity-75 text-decoration-none hover-white">Gourmet Cupcakes</Link></li>
              <li><Link to="/products?category=Donut" className="text-light text-opacity-75 text-decoration-none hover-white">Glazed Donuts</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-bakery-gold fw-bold text-uppercase mb-3 font-serif">Customer Care</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              <li><Link to="/cart" className="text-light text-opacity-75 text-decoration-none hover-white">Shopping Cart</Link></li>
              <li><Link to="/my-orders" className="text-light text-opacity-75 text-decoration-none hover-white">Track Order</Link></li>
              <li><Link to="/my-profile" className="text-light text-opacity-75 text-decoration-none hover-white">Delivery Addresses</Link></li>
              <li><Link to="/bulk-order-inquiry" className="text-light text-opacity-75 text-decoration-none hover-white">Custom Tier Cake Quotes</Link></li>
              <li><Link to="/owner/login" className="text-bakery-gold text-decoration-none hover-white">Store Admin Portal</Link></li>
            </ul>
          </div>

          {/* Store Info */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-bakery-gold fw-bold text-uppercase mb-3 font-serif">Visit Our Kitchen</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-light text-opacity-75">
              <li className="d-flex align-items-start">
                <i className="bi bi-geo-alt-fill text-bakery-gold me-2 mt-1"></i>
                <span>42 Pastry Lane, Indiranagar, Bangalore, Karnataka - 560038</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-telephone-fill text-bakery-gold me-2"></i>
                <span>+91 98765 43210 / 080-2555-BAKE</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-envelope-fill text-bakery-gold me-2"></i>
                <span>hello@sweetdelightbakery.com</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-clock-fill text-bakery-gold me-2"></i>
                <span>Open 7 Days: 7:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-light text-opacity-50">
          <div>
            &copy; {new Date().getFullYear()} SweetDelight Bakery & Patisserie. All rights reserved.
          </div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>100% Eggless Options Available</span>
            <span>•</span>
            <span>Razorpay Secure Online Payments</span>
            <span>•</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
