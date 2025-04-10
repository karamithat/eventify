"use client";

import { useState } from "react";
import Stepper from "../../components/ui/Stepper";
import Container from "../../components/ui/Container";
import { Calendar, CircleDollarSign, Clock, Ticket } from "lucide-react";

interface EventData {
  title: string;
  category: string;
  startDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  eventType: "ticketed" | "free";
  ticketName: string;
  ticketPrice: number;
}

const CreateEventPage = () => {
  const steps = ["Edit", "Banner", "Ticketing", "Review"];
  const [activeStep, setActiveStep] = useState(0);

  // State'i tanımla
  const [eventData, setEventData] = useState<EventData>({
    title: "Sample Event Title",
    category: "Music",
    startDate: "2025-06-12",
    startTime: "19:00",
    endTime: "22:00",
    location: "Event Venue",
    description: "Sample description",
    eventType: "ticketed",
    ticketName: "",
    ticketPrice: 0,
  });
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-10 bg-white">
      <Container>
        <h1 className="text-3xl font-bold text-gray-900 mb-10">
          Create a New Event
        </h1>

        <Stepper
          steps={steps}
          activeStep={activeStep}
          onChange={setActiveStep}
        />

        {activeStep === 0 && (
          <form className="mt-10 space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={eventData.title}
                    onChange={handleChange}
                    placeholder="Enter the name of your event"
                    className="w-full border rounded-md py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={eventData.category}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3"
                  >
                    <option>Please select one</option>
                    <option>Music</option>
                    <option>Sport</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Date & Time</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventData.startDate}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3"
                  />
                  <Calendar
                    className="absolute top-9 right-3 text-gray-400"
                    size={20}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={eventData.startTime}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3"
                  />
                  <Clock
                    className="absolute top-9 right-3 text-gray-400"
                    size={20}
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={eventData.endTime}
                    onChange={handleChange}
                    className="w-full border rounded-md py-2 px-3"
                  />
                  <Clock
                    className="absolute top-9 right-3 text-gray-400"
                    size={20}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Location</h2>
              <select
                name="location"
                value={eventData.location}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3"
              >
                <option>Please select one</option>
                <option>Online</option>
                <option>Venue</option>
              </select>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Additional Information
              </h2>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                className="w-full border rounded-md py-2 px-3 h-32"
                placeholder="Describe your event"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary text-white rounded-md px-6 py-2"
              >
                Save & Continue
              </button>
            </div>
          </form>
        )}

        {activeStep === 1 && (
          <div className="mt-10 space-y-6">
            <div>
              <h2 className="text-2xl font-bold">{eventData.title}</h2>
              <p className="text-sm text-gray-600">{eventData.location}</p>
              <p className="text-sm text-gray-600">
                {eventData.startDate} at {eventData.startTime}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Upload Image</h3>
              <input
                type="file"
                className="w-full border py-2 px-3 rounded-md"
              />
              <p className="text-xs text-gray-600 mt-2">
                Feature Image must be at least 1170 pixels wide by 504 pixels
                high.
                <br />
                Valid file formats: JPG, GIF, PNG.
              </p>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveStep(0)}
                className="text-primary hover:underline"
              >
                Go back to Edit Event
              </button>
              <button
                onClick={handleNext}
                className="bg-primary text-white rounded-md px-6 py-2"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="mt-10 space-y-8">
            <div>
              <h2 className="text-2xl font-bold">{eventData.title}</h2>
              <p className="text-sm text-gray-600">{eventData.location}</p>
              <p className="text-sm text-gray-600">
                {eventData.startDate} at {eventData.startTime}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                What type of event are you running?
              </h3>
              <div className="flex gap-6">
                <div
                  onClick={() =>
                    setEventData({ ...eventData, eventType: "ticketed" })
                  }
                  className={`border rounded-lg p-6 w-full cursor-pointer flex flex-col items-center justify-center ${
                    eventData.eventType === "ticketed"
                      ? "border-indigo-700 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                >
                  <Ticket className="mb-2" size={32} />
                  <span className="font-semibold">Ticketed Event</span>
                  <span className="text-sm">
                    My event requires tickets for entry
                  </span>
                </div>

                <div
                  onClick={() =>
                    setEventData({ ...eventData, eventType: "free" })
                  }
                  className={`border rounded-lg p-6 w-full cursor-pointer flex flex-col items-center justify-center ${
                    eventData.eventType === "free"
                      ? "border-indigo-700 bg-indigo-50"
                      : "border-gray-300"
                  }`}
                >
                  <CircleDollarSign className="mb-2" size={32} />
                  <span className="font-semibold">Free Event</span>
                  <span className="text-sm">Im running a free event</span>
                </div>
              </div>
            </div>

            {eventData.eventType === "ticketed" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  What tickets are you selling?
                </h3>
                <div className="grid md:grid-cols-2 gap-6 items-end">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ticket Name
                    </label>
                    <input
                      type="text"
                      name="ticketName"
                      placeholder="Ticket Name e.g. General Admission"
                      value={eventData.ticketName}
                      onChange={handleChange}
                      className="w-full border rounded-md py-2 px-3"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">
                      Ticket Price
                    </label>
                    <input
                      type="number"
                      name="ticketPrice"
                      placeholder="0.00"
                      value={eventData.ticketPrice}
                      onChange={handleChange}
                      className="w-full border rounded-md py-2 px-3"
                    />
                    <span className="absolute left-3 top-9 text-gray-600">
                      ₺
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="text-primary hover:underline"
              >
                Go back
              </button>
              <button
                onClick={handleNext}
                className="bg-primary text-white rounded-md px-6 py-2"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div className="mt-10 p-6 border rounded bg-gray-50">
            Review Step Content Here...
          </div>
        )}
      </Container>
    </section>
  );
};

export default CreateEventPage;
