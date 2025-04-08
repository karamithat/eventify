import React from "react";
import Hero from "./components/home/Hero";
import Container from "./components/ui/Container";
import ExploreCategories from "./components/home/ExploreCategories";
import PopularEvents from "./components/home/PopularEvents";
import DiscoverOnlineEvents from "./components/home/DiscoverOnlineEvents";
import PersonalizedSection from "./components/home/PersonalizedSection";
import TrendingEvents from "./components/home/TrendingEvents";
import CreateEventCTA from "./components/home/CreateEventCTA";
import Newsletter from "./components/home/Newsletter";
import Navbar from "./components/ui/Navbar";
import Footer from "./components/ui/Footer";

const page = () => {
  return (
    <div className="">
      <Navbar />
      <Hero />
      <Container>
        <ExploreCategories />
        <PopularEvents />
        <DiscoverOnlineEvents />
        <PersonalizedSection />
        <TrendingEvents />
      </Container>
      <CreateEventCTA />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default page;
