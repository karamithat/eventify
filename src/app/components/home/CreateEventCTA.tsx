import { CalendarPlus } from "lucide-react";
import Button from "../ui/Button";

const CreateEventCTA = () => {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-white py-16"
      style={{ backgroundImage: "url('/images/backgrounds/bg-dark.png')" }}
    >
      <div className="px-4 sm:px-8 lg:px-16 flex flex-col md:flex-row items-center justify-around gap-6 text-left">
        {/* Text Area */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-secondary mb-2">
            Create an event with Eventify
          </h2>
          <p className="text-sm sm:text-base text-yellow-300">
            Got a show, event, activity or a great experience? Partner with us &
            get listed on Eventify
          </p>
        </div>

        {/* Button */}
        <Button
          href="/create-event"
          icon={<CalendarPlus />}
          iconPosition="left"
        >
          Create Event
        </Button>
      </div>
    </section>
  );
};

export default CreateEventCTA;
