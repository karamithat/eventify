import React from "react";
import Hero from "../components/home/Hero";
import Container from "../components/ui/Container";
import ExploreCategories from "../components/home/ExploreCategories";
import PopularEvents from "../components/home/PopularEvents";
import DiscoverOnlineEvents from "../components/home/DiscoverOnlineEvents";
import PersonalizedSection from "../components/home/PersonalizedSection";
import TrendingEvents from "../components/home/TrendingEvents";
import CreateEventCTA from "../components/home/CreateEventCTA";
import Newsletter from "../components/home/Newsletter";

const MainPage = () => {
  return (
    <div>
      <Hero
        title="Don’t miss out!"
        subtitle="Explore the vibrant events happening locally and globally."
        backgroundImage="/images/events/hero.png"
        location="İstanbul"
      />
      <Container>
        <ExploreCategories />
        <PopularEvents />
        <DiscoverOnlineEvents />
        <PersonalizedSection />
        <TrendingEvents />
      </Container>
      <CreateEventCTA />
      <Newsletter />
    </div>
  );
};

export default MainPage;
