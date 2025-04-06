import Image from "next/image";

const categories = [
  {
    title: "Entertainment",
    image: "/images/categories/entertainment.png",
  },
  {
    title: "Educational & Business",
    image: "/images/categories/educational.png",
  },
  {
    title: "Cultural & Arts",
    image: "/images/categories/cultural.png",
  },
  {
    title: "Sports & Fitness",
    image: "/images/categories/sports.png",
  },
  {
    title: "Technology & Innovation",
    image: "/images/categories/technology.png",
  },
  {
    title: "Travel & Adventure",
    image: "/images/categories/travel.png",
  },
];

const ExploreCategories = () => {
  return (
    <section className="py-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-left mb-10">
        Explore Categories
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 place-items-center">
        {categories.map((category) => (
          <div key={category.title} className="text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden mx-auto mb-3">
              <Image
                src={category.image}
                alt={category.title}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-gray-700 text-sm sm:text-base font-medium">
              {category.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExploreCategories;
