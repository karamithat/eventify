import EventCard from "../ui/EventCard";
import MoreButton from "../ui/MoreButton";

const events = [
  {
    date: "JAN 13",
    title: "The Road to Jobs and Internships: Starting with LinkedIn",
    category: "Educational & Business",
    image: "/images/events/webinar.png",
    location: "Online",
    time: "6 PM - 7:30 PM",
    price: "INR 49",
    interested: "21 interested",
  },
  {
    date: "NOV 29",
    title: "Online Zumba Dance Fitness Class over Zoom",
    category: "Sports & Fitness",
    image: "/images/events/zumba.png",
    location: "Online",
    time: "7 PM - 8 PM",
    price: "CAD 7",
    interested: "",
  },
  {
    date: "DEC 12",
    title: "Easy book folding: Christmas edition",
    category: "Cultural & Arts",
    image: "/images/events/book-folding.png",
    location: "Online",
    time: "4 PM - 5:30 PM",
    price: "FREE",
    interested: "10 interested",
  },
  {
    date: "DEC 14",
    title: "Voices from the Rome Synod: An evening with Austen Ivereigh",
    category: "Cultural & Arts",
    image: "/images/events/synod.jpg",
    location: "Online",
    time: "1 PM - 2 PM",
    price: "FREE",
    interested: "37 interested",
  },
  {
    date: "NOV 29",
    title: "HackerX - Zurich (Full-Stack) 11/29 (Virtual)",
    category: "Technology & Innovation",
    image: "/images/events/hackerx.jpg",
    location: "Online",
    time: "11:30 AM - 1:30 PM",
    price: "USD 0 - 50",
    interested: "16 interested",
  },
  {
    date: "DEC 07",
    title: "FRIENDS OF THE METAVERSE: Season of Innovation 2023",
    category: "Technology & Innovation",
    image: "/images/events/metaverse.jpg",
    location: "Online",
    time: "10:30 AM - 5 PM",
    price: "USD 0 - 150",
    interested: "10 interested",
  },
];

const DiscoverOnlineEvents = () => {
  return (
    <section className="py-16">
      {/* Başlık */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-8">
        Discover Best of Online Events
      </h2>

      {/* Etkinlikler Grid */}
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

      {/* See More Butonu */}
      <div className="flex justify-center mt-10">
        <MoreButton />
      </div>
    </section>
  );
};

export default DiscoverOnlineEvents;
