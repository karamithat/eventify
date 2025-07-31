import Image from "next/image";
import { Star, Ticket } from "lucide-react";

type EventCardProps = {
  category: string;
  date: string;
  title: string;
  location: string;
  time: string;
  price: string;
  interested?: string;
  image: string;
  country?: string; // ✅ yeni ekledik
  eventId?: string;
};

const EventCard = ({
  category,
  date,
  title,
  location,
  time,
  price,
  interested,
  image,
  country, // ✅ yeni ekledik
}: EventCardProps) => {
  return (
    <div className="relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col h-full">
      {/* Image area */}
      <div className="relative bg-gray-200 w-full h-48 flex items-center justify-center">
        {/* Country Badge (doğru yer) */}
        {country && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
            {country}
          </div>
        )}

        {image ? (
          <Image
            src={image}
            alt={title}
            width={400}
            height={160}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}

        {/* Star Icon */}
        <div className="absolute top-2 right-2 bg-white rounded-full p-2">
          <Star className="w-4 h-4 text-gray-700" fill="white" />
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-0 left-0 bg-secondary text-xs font-medium px-2 py-2 rounded-tr-md">
          {category}
        </div>
      </div>

      {/* Details area */}
      <div className="py-4 flex gap-3 flex-grow">
        {/* Date */}
        <div className="text-center text-sm font-semibold text-dark-blue min-w-16">
          <div>{date.split(" ")[0]}</div>
          <div>{date.split(" ")[1]}</div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold leading-snug mb-1">{title}</h3>
          <p className="text-xs text-gray-500 mb-1">{location}</p>
          <p className="text-xs text-gray-500 mb-2">{time}</p>
          <div className="flex items-center gap-2 text-xs text-gray-700">
            <Ticket className="w-3 h-3" />
            <span>{price}</span>
            <span>•</span>
            <span className="text-dark-blue">★ {interested}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
