import { MapPin, ChevronDown, Search } from "lucide-react";

const Hero = () => {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white flex items-center"
      style={{ backgroundImage: "url('/images/events/hero.png')" }}
    >
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 text-center py-16">
        {/* Başlık */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          Don’t miss out!
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
          Explore the <span className="text-secondary">vibrant events</span>{" "}
          happening locally and globally.
        </h2>

        {/* Search Box */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* Search Input */}
          <div className="flex items-center bg-white rounded-md w-full sm:w-[400px] px-4 py-3 text-gray-600">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search Events, Categories, Location,..."
              className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
            />
          </div>

          {/* Location Select */}
          <div className="flex items-center bg-white rounded-md px-4 py-3 text-gray-600 w-full sm:w-auto cursor-pointer">
            <MapPin size={20} className="text-gray-400 mr-2" />
            <span className="text-sm">Mumbai</span>
            <ChevronDown size={20} className="text-gray-400 ml-2" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
