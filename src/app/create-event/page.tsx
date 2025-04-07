"use client";

import { CalendarDays, Clock } from "lucide-react";
import Stepper from "../components/ui/Stepper";

const CreateEventPage = () => {
  return (
    <section className="min-h-screen bg-white text-primary py-10">
      <div className="container mx-auto px-4 sm:px-8 lg:px-16">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          Create a New Event
        </h1>

        <Stepper />

        {/* Form */}
        <form className="space-y-10">
          {/* Event Details */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Event Details</h2>

            <div className="space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter the name of your event"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                />
              </div>

              {/* Event Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Category <span className="text-red-500">*</span>
                </label>
                <select className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none">
                  <option>Please select one</option>
                  {/* Populate dynamically */}
                </select>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Date & Time</h2>

            {/* Event Type */}
            <div className="flex items-center gap-6 mb-4">
              <span className="text-sm font-medium">
                Event Type <span className="text-red-500">*</span>
              </span>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="eventType"
                  defaultChecked
                  className="accent-primary"
                />
                Single Event
              </label>
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="eventType"
                  className="accent-primary"
                />
                Recurring Event
              </label>
            </div>

            {/* Session Date Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Start Date */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                />
                <CalendarDays className="w-4 h-4 text-gray-400 absolute right-3 top-9" />
              </div>

              {/* Start Time */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                />
                <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-9" />
              </div>

              {/* End Time */}
              <div className="relative">
                <label className="block text-sm font-medium mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
                />
                <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-9" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <label className="block text-sm font-medium mb-1">
              Where will your event take place?{" "}
              <span className="text-red-500">*</span>
            </label>
            <select className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none">
              <option>Please select one</option>
            </select>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Additional Information
            </h2>
            <label className="block text-sm font-medium mb-1">
              Event Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe what's special about your event & other important details."
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-white font-medium px-6 py-2 rounded-md hover:bg-primary-dark transition"
            >
              Save & Continue
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateEventPage;
