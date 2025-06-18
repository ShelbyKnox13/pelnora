import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet";
import { AuthModals } from "@/components/auth/AuthModals";

const Home = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  // Check for referral ID and show signup modal automatically
  useEffect(() => {
    const checkReferralId = () => {
      const storedRefId = sessionStorage.getItem('referralId');
      if (storedRefId) {
        setTimeout(() => {
          setShowSignupModal(true);
        }, 100);
      }
    };
    checkReferralId();
  }, []);

  return (
    <>
      <Helmet>
        <title>Pelnora Jewellers - Timeless Elegance</title>
        <meta name="description" content="Experience the artistry of Pelnora Jewellers, where each piece tells a story of elegance and tradition" />
        <meta property="og:title" content="Pelnora Jewellers - Timeless Elegance" />
        <meta property="og:description" content="Experience the artistry of Pelnora Jewellers, where each piece tells a story of elegance and tradition" />
        <meta property="og:type" content="website" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>
      
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Montserrat', sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .hero {
          height: 100vh;
          background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)),
                      url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80');
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          padding: 0 2rem;
        }

        .hero-content h1 {
          font-family: 'Playfair Display', serif;
          font-size: 3.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-content p {
          font-size: 1.2rem;
          max-width: 600px;
          margin: 0 auto;
          opacity: 0.9;
        }

        .section {
          padding: 5rem 10%;
        }

        .about {
          background: #f9f5f0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .about-image {
          width: 100%;
          height: 600px;
          object-fit: cover;
          border-radius: 8px;
        }

        .about-content h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #1a1a1a;
        }

        .about-content p {
          color: #666666;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          line-height: 1.7;
        }

        .gallery {
          background: white;
          text-align: center;
        }

        .gallery h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #1a1a1a;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item {
          position: relative;
          overflow: hidden;
          height: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          
          .about {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .gallery-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .section {
            padding: 3rem 5%;
          }
        }
      `}</style>

      <div className="min-h-screen">
        <Navbar />
        
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1>Where Craftsmanship<br />Meets Legacy</h1>
            <p>Experience the artistry of Pelnora Jewellers, where each piece tells a story of elegance and tradition</p>
          </div>
        </section>

        {/* About Section */}
        <section className="section about">
          <img 
            src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Crafting jewelry" 
            className="about-image" 
          />
          <div className="about-content">
            <h2>Handcrafted Brilliance Since Generations</h2>
            <p>At Pelnora Jewellers, we believe that every piece of jewelry should be as unique as the person wearing it. Our master craftsmen combine traditional techniques with contemporary design to create timeless pieces that celebrate your individuality.</p>
            <p>Each creation is a testament to our commitment to excellence, using only the finest materials and ethically sourced gemstones. Our legacy of craftsmanship spans generations, ensuring that every piece that bears the Pelnora name is of exceptional quality.</p>
            <p>We take pride in creating bespoke designs that not only capture the essence of luxury but also tell your personal story. From intimate family heirlooms to grand statement pieces, our artisans pour their heart and soul into every creation.</p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="section gallery">
          <h2>Our Signature Pieces</h2>
          <div className="gallery-grid">
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Exquisite Diamond Necklace" 
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Traditional Gold Earrings" 
              />
            </div>
            <div className="gallery-item">
              <img 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                alt="Contemporary Bracelets" 
              />
            </div>
          </div>
        </section>

        <Footer />
      </div>
      
      <AuthModals
        showLogin={showLoginModal}
        showSignup={showSignupModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseSignup={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
    </>
  );
};

export default Home;
