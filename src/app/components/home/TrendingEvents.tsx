import EventCard from "../ui/EventCard";
import MoreButton from "../ui/MoreButton";

const events = [
  {
    date: "NOV 25",
    title: "Voca Loca - Aditya Gadhvi in Vadodara",
    category: "Entertainment",
    image: "/images/events/aditya.png",
    location: "Satyanarayan Lawns, Vadodara",
    time: "6 PM - 10:30 PM",
    price: "INR 450 - 30k",
    interested: "528 interested",
    country: "India",
  },
  {
    date: "DEC 02",
    title: "Camp United Nations for Girls Los Angeles 2023",
    category: "Educational & Business",
    image: "/images/events/camp-un.png",
    location: "Renaissance Los Angeles Airport Hotel",
    time: "8 AM - 12 PM",
    price: "USD 125",
    interested: "",
    country: "United States",
  },
  {
    date: "DEC 01 - 02",
    title: "Bollywood Gen Z Party",
    category: "Entertainment",
    image: "/images/events/bollywood.png",
    location: "Brown Alley, Melbourne",
    time: "9:30 PM - 3:30 AM",
    price: "AUD 0 - 40",
    interested: "137 interested",
    country: "Australia",
  },
  {
    date: "NOV 28",
    title: "GTApreneurs Nov 28 Business Networking Event w/ Food",
    category: "Educational & Business",
    image: "/images/events/gta.png",
    location: "Earl Bales Community Centre, Toronto",
    time: "5 PM - 8 PM",
    price: "CAD 22",
    interested: "13 interested",
    country: "Canada",
  },
  {
    date: "NOV 25",
    title: "A Day of well-being and creativity",
    category: "Cultural & Arts",
    image: "/images/events/wellbeing.png",
    location: "Atelier du monde for Kids, Brussels",
    time: "10 AM - 8:30 PM",
    price: "EUR 20 - 45",
    interested: "10 interested",
    country: "Belgium",
  },
  {
    date: "NOV 30",
    title: "Dystopia's Winter Wonderland Dystopia's Winter Wonderland",
    category: "Entertainment",
    image: "/images/events/dystopia.png",
    location: "Hyde Sunset Kitchen + Cocktails, CA",
    time: "8:30 PM - 11:50 PM",
    price: "USD 23.5 - 35",
    interested: "10 interested",
    country: "United States",
  },
];

const TrendingEvents = () => {
  return (
    <section className="py-8">
      {/* Başlık */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-8">
        Trending Events around the World
      </h2>

      {/* Etkinlikler Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {events.map((event, index) => (
          <div key={index}>
            <EventCard
              category={event.category}
              date={event.date}
              title={event.title}
              location={event.location}
              time={event.time}
              price={event.price}
              interested={event.interested}
              image={event.image}
              country={event.country}
            />
          </div>
        ))}
      </div>

      {/* See More Butonu */}
      <div className="flex justify-center mt-10">
        <MoreButton />
      </div>
    </section>
  );
};

export default TrendingEvents;
