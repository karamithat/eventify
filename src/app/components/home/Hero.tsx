import { MapPin, ChevronDown, Search } from "lucide-react";

interface HeroProps {
  title?: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  location?: string;
}

const Hero = ({
  title,
  subtitle,
  backgroundImage,
  backgroundColor,
  location = "İstanbul",
}: HeroProps) => {
  const bgStyle = backgroundImage
    ? { backgroundImage: `url('${backgroundImage}')` }
    : {};

  const bgClass = backgroundColor ? backgroundColor : "bg-primary";

  return (
    <section
      className={`relative bg-cover bg-center bg-no-repeat text-white flex items-center ${bgClass}`}
      style={bgStyle}
    >
      {/* Overlay (sadece backgroundImage varsa) */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-primary opacity-50"></div>
      )}

      <div className="relative container mx-auto px-4 sm:px-8 lg:px-16 text-center py-36">
        {/* Başlık */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
          {title}
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
          {subtitle}
        </h2>

        {/* Search Box */}
        <div className="mt-10 flex justify-center">
          <div className="flex flex-col sm:flex-row bg-white text-gray-600 rounded-md w-full max-w-xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center flex-1 px-4 py-3">
              <Search size={20} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search Events, Categories, Location,..."
                className="flex-1 outline-none text-sm placeholder-gray-400 bg-transparent"
              />
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-gray-300"></div>

            {/* Location Select */}
            <div className="flex items-center px-4 py-3 cursor-pointer border-t sm:border-t-0 sm:border-l border-gray-300">
              <MapPin size={20} className="text-gray-400 mr-2" />
              <span className="text-sm">{location}</span>
              <ChevronDown size={20} className="text-gray-400 ml-2" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
