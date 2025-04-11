"use client";

import { useState } from "react";
import Stepper from "../../components/ui/Stepper";
import Container from "../../components/ui/Container";
import { Calendar, CircleDollarSign, Clock, Ticket } from "lucide-react";
import Image from "next/image";

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

            <div className="flex justify-end gap-4 items-center">
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
                      className="w-full border rounded-md py-2 px-3 pr-10"
                    />
                    <span className="absolute left-13 top-8 text-gray-600">
                      ₺
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end items-center gap-5">
              <button
                onClick={() => setActiveStep(activeStep - 1)}
                className="text-primary hover:underline"
              >
                Go back to Banner
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
          <section className="py-10 bg-white">
            <h1 className="text-3xl font-bold text-gray-900 mb-10">
              Event Title
            </h1>
            <p className="text-gray-700">Location</p>
            <p className="text-gray-700 mb-8">Time</p>

            <div className="mt-10 space-y-6">
              <p className="text-lg font-semibold mb-4">
                Nearly there! Check everything’s correct.
              </p>

              {/* Event Banner */}
              <div className="rounded-md overflow-hidden">
                <Image
                  src="/images/events/path-to-event-banner.png"
                  alt="Event Banner"
                  width={1170}
                  height={504}
                  className="object-cover w-full"
                />
              </div>

              {/* Event Details Section */}
              <div className="space-y-4">
                <h2 className="text-3xl font-semibold">Event Title</h2>

                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">Date and Time</p>
                    <p>📅 Day, Date</p>
                    <p>🕒 Time</p>
                    <a className="text-indigo-600" href="#">
                      + Add to Calendar
                    </a>
                  </div>

                  <div>
                    <p className="font-semibold">Ticket Information</p>
                    <p>🎫 Ticket Type: Price /ticket</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold">Location</p>
                  <p>📍 Address</p>
                  <div className="mt-2 bg-gray-200 w-full h-48 flex items-center justify-center">
                    [Map Placeholder]
                  </div>
                </div>

                <div>
                  <p className="font-semibold">Hosted by</p>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-300 rounded-md w-12 h-12"></div>
                    <div>
                      <p>Host Name</p>
                      <button className="border px-3 py-1 rounded mr-2">
                        Contact
                      </button>
                      <button className="border px-3 py-1 rounded">
                        + Follow
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold mb-1">Event Description</p>
                  <p className="text-gray-700">
                    Lorem ipsum dolor sit amet consectetur. Eget vulputate
                    sociis sit urna sit aliquet. Vivamus facilisis diam libero
                    dolor volutpat diam eu. Quis a id posuere etiam at enim
                    vivamus. Urna nisi malesuada libero enim ornare in viverra.
                    Nibh commodo quis tellus aliquet nibh tristique lobortis id.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <button className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-md hover:bg-yellow-500">
                  Save for Later
                </button>
                <button className="bg-indigo-700 text-white px-6 py-2 rounded-md hover:bg-indigo-800">
                  Publish Event
                </button>
              </div>
            </div>
          </section>
        )}
      </Container>
    </section>
  );
};

export default CreateEventPage;
