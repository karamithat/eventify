"use client";

import React from "react";
import Link from "next/link";
import Container from "../../components/ui/Container";
import {
  Calendar,
  Users,
  MapPin,
  Ticket,
  Heart,
  Shield,
  Zap,
  Globe,
  Star,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  MapIcon,
  Award,
  Target,
  Lightbulb,
} from "lucide-react";

const AboutPage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-primary">Eventify</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're passionate about bringing people together through
              unforgettable events. Our platform makes it easy to discover,
              create, and manage events that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/events"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition font-medium flex items-center justify-center gap-2"
              >
                Explore Events
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/create-event"
                className="bg-white border-2 border-primary text-primary px-8 py-3 rounded-lg hover:bg-primary/5 transition font-medium"
              >
                Create Event
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that meaningful connections happen when people come
                together. Our mission is to democratize event creation and make
                it accessible for everyone to build communities, share
                knowledge, and create lasting memories.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Connect Communities
                    </h3>
                    <p className="text-gray-600">
                      Bringing like-minded people together through shared
                      interests and experiences.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Empower Creators
                    </h3>
                    <p className="text-gray-600">
                      Providing tools and platform for anyone to create and
                      manage successful events.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Foster Growth
                    </h3>
                    <p className="text-gray-600">
                      Creating opportunities for personal and professional
                      development through events.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-24 h-24 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    10,000+
                  </h3>
                  <p className="text-gray-600">Events Created</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4">
                <Calendar className="w-8 h-8 text-secondary" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4">
                <Ticket className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Eventify?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built a comprehensive platform that handles everything from
              event creation to attendee management, so you can focus on what
              matters most.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Easy Event Creation
              </h3>
              <p className="text-gray-600">
                Create professional events in minutes with our intuitive
                interface and customizable templates.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition">
                <Ticket className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Ticketing
              </h3>
              <p className="text-gray-600">
                Built-in ticketing system with QR codes, digital tickets, and
                seamless attendee management.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-200 transition">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Location Flexibility
              </h3>
              <p className="text-gray-600">
                Support for both physical venues and online events with
                integrated maps and directions.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-200 transition">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with reliable infrastructure to ensure
                your events run smoothly.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Global Reach
              </h3>
              <p className="text-gray-600">
                Connect with audiences worldwide with multi-language support and
                global payment options.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-200 transition">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Analytics & Insights
              </h3>
              <p className="text-gray-600">
                Detailed analytics to help you understand your audience and
                improve future events.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Eventify by the Numbers
            </h2>
            <p className="text-xl text-primary-light">
              Join thousands of event creators and attendees who trust Eventify
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">50K+</div>
              <div className="text-primary-light">Events Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">1M+</div>
              <div className="text-primary-light">Tickets Sold</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">25K+</div>
              <div className="text-primary-light">Event Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-primary-light">Uptime</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're a passionate team of designers, developers, and event
              enthusiasts dedicated to revolutionizing how people connect
              through events.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sarah Johnson
              </h3>
              <p className="text-primary font-medium mb-2">CEO & Founder</p>
              <p className="text-gray-600 text-sm">
                Former event manager with 10+ years experience in building
                communities and organizing large-scale events.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition">
                <Zap className="w-16 h-16 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mike Chen
              </h3>
              <p className="text-primary font-medium mb-2">CTO</p>
              <p className="text-gray-600 text-sm">
                Full-stack developer passionate about creating scalable
                platforms that bring people together.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-105 transition">
                <Heart className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Emma Davis
              </h3>
              <p className="text-primary font-medium mb-2">Head of Design</p>
              <p className="text-gray-600 text-sm">
                UX/UI designer focused on creating intuitive and delightful
                experiences for event creators and attendees.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These core values guide everything we do and shape the way we
              build our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Community First
                  </h3>
                  <p className="text-gray-600">
                    We prioritize building tools that strengthen communities and
                    foster meaningful connections between people with shared
                    interests and goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Simplicity
                  </h3>
                  <p className="text-gray-600">
                    We believe powerful tools should be simple to use. Our
                    platform is designed to be intuitive for both tech-savvy
                    users and those new to event management.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Trust & Security
                  </h3>
                  <p className="text-gray-600">
                    We're committed to protecting user data and ensuring secure
                    transactions. Trust is the foundation of our platform and
                    community.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Excellence
                  </h3>
                  <p className="text-gray-600">
                    We continuously strive to improve our platform and provide
                    the best possible experience for event organizers and
                    attendees alike.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Have questions, feedback, or need help with your events? We'd love
              to hear from you and help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email Us
              </h3>
              <p className="text-gray-600 mb-4">
                Get in touch with our support team
              </p>
              <a
                href="mailto:hello@eventify.com"
                className="text-primary hover:text-primary-dark font-medium"
              >
                hello@eventify.com
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Call Us
              </h3>
              <p className="text-gray-600 mb-4">Speak with our team directly</p>
              <a
                href="tel:+1-555-123-4567"
                className="text-primary hover:text-primary-dark font-medium"
              >
                +1 (555) 123-4567
              </a>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Visit Us
              </h3>
              <p className="text-gray-600 mb-4">
                Come to our office for a chat
              </p>
              <p className="text-primary font-medium">
                123 Event Street
                <br />
                San Francisco, CA 94102
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/contact"
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition font-medium inline-flex items-center gap-2"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Create Amazing Events?
            </h2>
            <p className="text-xl mb-8 text-primary-light">
              Join thousands of event creators who trust Eventify to bring their
              ideas to life. Start your journey today and see the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create-event"
                className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Create Your First Event
              </Link>
              <Link
                href="/events"
                className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white/10 transition font-medium"
              >
                Explore Events
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
};

export default AboutPage;
