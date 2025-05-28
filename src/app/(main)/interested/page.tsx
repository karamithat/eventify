import Container from "@/app/components/ui/Container";
import EventCard from "@/app/components/ui/EventCard";
import React from "react";

const events = [
  {
    date: "NOV 25 - 26",
    title: "Lakeside Camping at Pawna",
    category: "Travel & Adventure",
    image: "/images/events/camping.png",
    location: "Adventure Geek - Explore the Unexplored",
    time: "8:30 AM - 7:30 PM",
    price: "1.400 ₺",
    interested: "14 interested",
  },
  {
    date: "DEC 02",
    title: "Sound Of Christmas 2023",
    category: "Cultural & Arts",
    image: "/images/events/christmas.png",
    location: "Bal Gandharva Rang Mandir, Mumbai",
    time: "6:30 PM - 9:30 PM",
    price: "499 ₺",
    interested: "16 interested",
  },
  {
    date: "DEC 02",
    title: "Meet the Royal College of Art in Mumbai 2023",
    category: "Educational & Business",
    image: "/images/events/college.png",
    location: "Sofitel Mumbai BKC, Mumbai",
    time: "10 AM - 5 PM",
    price: "FREE",
    interested: "",
  },
  {
    date: "DEC 03",
    title: "Global Engineering Education Expo 2023",
    category: "Educational & Business",
    image: "/images/events/education.png",
    location: "The St. Regis, Mumbai",
    time: "10 AM - 2 PM",
    price: "FREE",
    interested: "48 interested",
  },
  {
    date: "DEC 08",
    title: "Cricket Business Meetup",
    category: "Sports & Fitness",
    image: "/images/events/cricket.png",
    location: "Play The Turf, Malad, Mumbai",
    time: "6:30 PM - 9:30 PM",
    price: "399 ₺",
    interested: "",
  },
  {
    date: "FEB 14",
    title: "Valentine's Day Sail on a Yacht in Mumbai",
    category: "Travel & Adventure",
    image: "/images/events/valentines.png",
    location: "Mumbai",
    time: "7 AM - 8 PM",
    price: "2.999 ₺",
    interested: "160 interested",
  },
  {
    date: "DEC 03",
    title: "Global Engineering Education Expo 2023",
    category: "Educational & Business",
    image: "/images/events/education.png",
    location: "The St. Regis, Mumbai",
    time: "10 AM - 2 PM",
    price: "FREE",
    interested: "48 interested",
  },
  {
    date: "DEC 08",
    title: "Cricket Business Meetup",
    category: "Sports & Fitness",
    image: "/images/events/cricket.png",
    location: "Play The Turf, Malad, Mumbai",
    time: "6:30 PM - 9:30 PM",
    price: "399 ₺",
    interested: "",
  },
  {
    date: "FEB 14",
    title: "Valentine's Day Sail on a Yacht in Mumbai",
    category: "Travel & Adventure",
    image: "/images/events/valentines.png",
    location: "Mumbai",
    time: "7 AM - 8 PM",
    price: "2.999 ₺",
    interested: "160 interested",
  },
];

const InterestedPage = () => {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <h1 className="text-3xl font-bold mb-16">Interested Events</h1>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, index) => (
            <EventCard
              key={index}
              category={event.category}
              date={event.date}
              title={event.title}
              location={event.location}
              time={event.time}
              price={event.price}
              interested={event.interested}
              image={event.image}
            />
          ))}
        </div>
      </Container>
    </section>
  );
};

export default InterestedPage;
