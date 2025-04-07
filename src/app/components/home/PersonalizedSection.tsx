import { ArrowRight } from "lucide-react";
import Link from "next/link";

const PersonalizedSection = () => {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat text-primary py-20"
      style={{ backgroundImage: "url('/images/backgrounds/bg-yellow.png')" }}
    >
      <div className="text-center">
        {/* Başlık */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Events specially curated for you!
        </h2>

        {/* Açıklama */}
        <p className="text-base sm:text-lg mb-8">
          Get event suggestions tailored to your interests! Dont let your
          favorite events slip away.
        </p>

        {/* Buton */}
        <Link href="/interest">
          <button className="inline-flex items-center gap-2 bg-primary text-secondary font-medium px-8 py-3 rounded-md cursor-pointer hover:bg-primary-900 transition duration-300 ease-in-out">
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </section>
  );
};

export default PersonalizedSection;
