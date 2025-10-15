import React, { useState, useEffect, useCallback } from 'react';
import '../styles/home.css';
import { MdMenuBook, MdVerified } from 'react-icons/md';
import { FaChalkboardTeacher, FaVideo, FaGlobe } from 'react-icons/fa';
import { AiOutlineUserSwitch } from 'react-icons/ai';
import { IoSearchOutline } from 'react-icons/io5';
import Footer from '../components/Footer';

import hero1 from '../assets/HeroBanner.jpg';
import hero2 from '../assets/HeroBanner2.jpg';
import hero3 from '../assets/HeroBanner3.jpg';

const heroImages = [
  {
    image: hero1,
    title: (
      <>
        Transform Your Future with <span className="highlight">Elite Online Tutors</span>
      </>
    ),
    description: "Unlock unlimited potential with personalized learning experiences that adapt to your pace. Join thousands of successful students on their journey to excellence.",
    buttonText: "Start Your Journey"
  },
  {
    image: hero2,
    title: (
      <>
        Learn <span className="highlight">Anywhere, Anytime</span>
      </>
    ),
    description: "Break free from traditional classroom boundaries. Experience the freedom of learning from any location with our flexible online platform.",
    buttonText: "Explore Classes"
  },
  {
    image: hero3,
    title: (
      <>
        World-Class <span className="highlight">Expert Tutors</span>
      </>
    ),
    description: "Connect with certified educators who don't just teach - they inspire, motivate, and transform lives through innovative teaching methods.",
    buttonText: "Meet Our Tutors"
  },
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev === 0 ? heroImages.length - 1 : prev - 1));
  }, [isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => (prev === heroImages.length - 1 ? 0 : prev + 1));
  }, [isTransitioning]);

  useEffect(() => {
    // Only start the timer if search is not focused
    if (!isSearchFocused) {
      const timer = setInterval(() => {
        handleNext();
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [handleNext, isSearchFocused]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="home-container">
      {/* Hero Carousel */}
      <section className="hero-carousel">
        <div className="carousel-wrapper">
          {heroImages.map((item, index) => (
            <div
              key={index}
              className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="slide-overlay"></div>
              <div className="carousel-content">
                <h1 className="slide-title">{item.title}</h1>
                <p className="slide-description">{item.description}</p>
                <button className="cta-button">{item.buttonText}</button>

                <div className="search-box">
                  <IoSearchOutline className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Discover your perfect subject match..." 
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  />
                  <button className="search-button">Find Courses</button>
                </div>

                <div className="category-tags">
                  {['Tamil', 'English', 'Mathematics', 'Science', 'Social Studies'].map((subject) => (
                    <span key={subject} className="subject-tag">{subject}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button className="arrow left" onClick={handlePrev} aria-label="Previous slide">
            <span>&#10094;</span>
          </button>
          <button className="arrow right" onClick={handleNext} aria-label="Next slide">
            <span>&#10095;</span>
          </button>

          <div className="carousel-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Revolutionizing Education, One Student at a Time</h2>
          </div>
          <div className="about-content">
            <div className="about-highlight">
              <div>
                <strong>Our Mission:</strong> We're not just another tutoring platform - we're your partners in academic excellence and personal growth.
              </div>
            </div>
            <p>
              Join a community of passionate educators and ambitious learners who believe that every student deserves personalized attention and world-class education.
            </p>
            <p>
              Whether you're conquering challenging subjects, preparing for life-changing exams, or exploring new horizons, 
              we provide the tools, support, and inspiration to turn your academic dreams into reality.
            </p>
            <div className="stats-container">
              <div className="home-stat-item">
                <span className="home-stat-number">10,000+</span>
                <span className="home-stat-label">Happy Students</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-number">500+</span>
                <span className="home-stat-label">Expert Tutors</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-number">95%</span>
                <span className="home-stat-label">Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>What Makes Us Absolutely Amazing?</h2>
          </div>
          <p className="section-intro">
            Experience the future of education with our cutting-edge features designed to maximize your learning potential and academic success.
          </p>
          <div className="card-grid">
            <div className="feature-card">
              <div className="icon-wrapper"><MdMenuBook /></div>
              <h3>Complete Subject Universe</h3>
              <p>From core academics to creative arts, coding to keyboard skills — we've got your entire educational journey covered under one comprehensive platform.</p>
            </div>
            <div className="feature-card">
              <div className="icon-wrapper"><FaVideo /></div>
              <h3>Live + On-Demand Learning</h3>
              <p>Never miss a moment of learning! Join live interactive sessions or catch up with crystal-clear recorded lessons anytime, anywhere at your convenience.</p>
            </div>
            <div className="feature-card">
              <div className="icon-wrapper"><FaChalkboardTeacher /></div>
              <h3>Instant Tutor Connect</h3>
              <p>Got questions? Get answers instantly! Chat directly with your tutors and receive personalized guidance within minutes of your inquiry.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Online Tuitions Are Game-Changers?</h2>
          </div>
          <p className="section-intro">
            Step into the future of learning where flexibility meets excellence, and personalized education becomes your competitive advantage in today's world.
          </p>
          <div className="card-grid">
            <div className="benefit-card">
              <div className="icon-wrapper"><AiOutlineUserSwitch /></div>
              <h3>Hyper-Personalized Learning</h3>
              <p>Experience education tailored precisely to your learning style, pace, and goals. Every lesson is crafted with your unique needs in mind.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-wrapper"><FaGlobe /></div>
              <h3>Learn From Anywhere</h3>
              <p>Transform any space into your personal classroom. Whether at home, office, or traveling - learning has never been this accessible and comfortable.</p>
            </div>
            <div className="benefit-card">
              <div className="icon-wrapper"><MdVerified /></div>
              <h3>Elite Tutor Network</h3>
              <p>Connect with hand-picked, certified educators who are passionate about student success and committed to academic excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;
