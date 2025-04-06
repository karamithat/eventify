import React from "react";
import Navbar from "./components/ui/Navbar";
import Hero from "./components/home/Hero";
import Footer from "./components/ui/Footer";
import Container from "./components/ui/Container";
import ExploreCategories from "./components/home/ExploreCategories";
import PopularEvents from "./components/home/PopularEvents";
import DiscoverOnlineEvents from "./components/home/DiscoverOnlineEvents";

const page = () => {
  return (
    <div className="">
      <Navbar />
      <Hero />
      <Container>
        <ExploreCategories />
        <PopularEvents />
        <DiscoverOnlineEvents />
      </Container>
      <Footer />
    </div>
  );
};

export default page;
