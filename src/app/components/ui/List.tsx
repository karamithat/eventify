"use client";

import EventCard from "./EventCard";

const events = [
  {
    image: "/images/events/1.png",
    title: "DELHI BUSINESS NETWORK | BUSINESS...",
    date: "Dec 16",
    time: "10:30 AM - 1:30 PM",
    location: "Gurgaon, India",
    category: "Educational & Business",
    price: "INR 475",
    interested: "23",
    country: "IN",
  },
  {
    image: "/images/events/2.png",
    title: "Startup Talks - Innovative event for founders & St...",
    date: "Dec 17",
    time: "3 PM - 6 PM",
    location: "New Delhi, India",
    category: "Educational & Business",
    price: "FREE",
    interested: "51",
    country: "IN",
  },
  {
    image: "/images/events/3.png",
    title: "D2C Fashion Fiestaa - For Fashion Founders in Delhi",
    date: "Dec 02",
    time: "5 PM - 9 PM",
    location: "New Delhi, India",
    category: "Educational & Business",
    price: "INR 1000",
    interested: "90",
    country: "IN",
  },
  {
    image: "/images/events/4.png",
    title: "New Delhi Peaceful Investing Workshop",
    date: "Dec 10",
    time: "8 AM - 5 PM",
    location: "Bahadurgarh, India",
    category: "Educational & Business",
    price: "FREE",
    interested: "75",
    country: "IN",
  },
  {
    image: "/images/events/5.png",
    title: "Khushi Baby Stakeholder Summit | New Delhi",
    date: "Dec 12",
    time: "9 AM - 5 PM",
    location: "New Delhi, India",
    category: "Educational & Business",
    price: "FREE",
    interested: "12",
    country: "IN",
  },
  {
    image: "/images/events/6.png",
    title: "New Delhi 2024 Venture Capital World Summit",
    date: "Feb 06",
    time: "9 AM - 2 PM",
    location: "New Delhi, India",
    category: "Educational & Business",
    price: "INR 20,980 - 45,610",
    interested: "30",
    country: "IN",
  },
  // 📌 İstersen buraya daha fazlasını eklersin
];

const List = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <EventCard
          key={index}
          image={event.image}
          title={event.title}
          date={event.date}
          time={event.time}
          location={event.location}
          category={event.category}
          price={event.price}
          interested={event.interested}
          country={event.country}
        />
      ))}
    </div>
  );
};

export default List;
