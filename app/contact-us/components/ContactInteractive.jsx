"use client";

import ContactForm from "./ContactForm";
import DirectContact from "./DirectContact";

const ContactInteractive = ({ setSubmitted, setError }) => {
  return (
    <section
      className="
        py-7 lg:py-14
        px-6 lg:px-12
        bg-(--theme-bg)
        transition-colors duration-500
      "
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

          {/* LEFT — FORM */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2
                className="
                  font-[Crimson_Text]
                  text-3xl lg:text-4xl
                  font-light
                  text-(--theme-text)
                  mb-4
                "
              >
                Send Us a Message
              </h2>

              <p
                className="
                  font-[system-ui]
                  text-base lg:text-lg
                  text-(--theme-muted)
                  leading-relaxed
                "
              >
                Share your thoughts, questions, or simply introduce yourself.
                We read every message personally.
              </p>
            </div>

            <ContactForm
              setSubmitted={setSubmitted}
              setError={setError}
            />
          </div>

          {/* RIGHT — DIRECT CONTACT */}
          <div className="lg:col-span-2">
            <DirectContact />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactInteractive;
