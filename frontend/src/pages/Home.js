import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ SUBJECT MAP (ADDED)
  const subjectMap = {
    tamil: "Tamil",
    english: "English",
    maths: "Maths",
    math: "Maths",
    science: "Science",
    social: "Social",
    "social studies": "Social",
    chemistry: "Chemistry",
    physics: "Physics",
    zoology: "Zoology",
    botany: "Botany",
    economics: "Economics",
    computerscience: "ComputerScience",
    "computer science": "ComputerScience",
    cs: "ComputerScience",
    accounts: "Accounts"
  };

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

  // ✅ UPDATED SEARCH FUNCTION
  const handleSearch = () => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return;

    const matched = subjectMap[search];

    if (!matched) {
      alert("Subject not found ❌");
      return;
    }

    navigate(`/subjects/${matched}`);
  };

  useEffect(() => {
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                          
                </div>

                {/* ✅ FIXED SUBJECT TAGS */}
                <div className="category-tags">
                  {['Tamil', 'English', 'Maths', 'Science', 'Social'].map((subject) => (
                    <span
                      key={subject}
                      className="subject-tag"
                      onClick={() => navigate(`/subjects/${subject}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {subject}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          ))}

          <button className="arrow left" onClick={handlePrev}>
            <span>&#10094;</span>
          </button>
          <button className="arrow right" onClick={handleNext}>
            <span>&#10095;</span>
          </button>

          <div className="carousel-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* باقي code untouched */}
      <Footer />
    </div>
  );
};

export default Home;