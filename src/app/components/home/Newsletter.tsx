const Newsletter = () => {
  return (
    <section className="bg-secondary py-16">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left Text */}
        <div className="w-full md:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">
            Subscribe to our Newsletter
          </h2>
          <p className="text-sm sm:text-base text-primary">
            Receive our weekly newsletter & updates with new events from your
            favourite organizers & venues.
          </p>
        </div>

        {/* Input + Button */}
        <form className="flex flex-col sm:flex-row w-full md:w-auto gap-2 sm:gap-0">
          <input
            type="email"
            placeholder="Enter your e-mail address"
            className="flex-grow px-4 py-3 rounded-md sm:rounded-l-md sm:rounded-r-none outline-none bg-white text-gray-700 text-sm sm:text-base border border-gray-300"
          />
          <button
            type="submit"
            className=" cursor-pointer bg-primary text-secondary font-semibold px-6 py-3 rounded-md sm:rounded-r-md sm:rounded-l-none text-sm sm:text-base hover:bg-primary-dark transition-colors duration-200 w-full sm:w-auto"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
