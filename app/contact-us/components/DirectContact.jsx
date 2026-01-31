"use client";

import Icon from "@/components/ui/AppIcon";

const DirectContact = ({ className = "" }) => {
  const contactMethods = [
    {
      icon: "EnvelopeIcon",
      label: "Email",
      value: "contact@ravenfragrance.in",
      description: "For general inquiries and detailed questions",
    },
    {
      icon: "PhoneIcon",
      label: "Phone",
      value: "+91 84248 32375",
      description: "Monday – Friday, 10:00 AM – 6:00 PM IST",
    },
    {
      icon: "MapPinIcon",
      label: "Studio",
      value: "60ft Road, Sakinaka, Mumbai, India",
      description: "By appointment only",
    },
  ];

  return (
    <div className={`space-y-10 ${className}`}>
      {/* Header */}
      <div>
        <h2
          className="
            font-[Crimson_Text]
            text-3xl lg:text-4xl
            font-light
            text-(--theme-text)
            mb-3
          "
        >
          Direct Contact
        </h2>

        <p
          className="
            font-[system-ui]
            text-base lg:text-lg
            text-(--theme-muted)
            leading-relaxed
          "
        >
          Prefer a more direct approach? Reach out through any of these channels.
        </p>
      </div>

      {/* Contact Methods */}
      <div className="space-y-6">
        {contactMethods.map((method) => (
          <div
            key={method.label}
            className="
              p-6 lg:p-7
              border border-(--theme-border)
              bg-(--theme-bg)
              transition-colors duration-300
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  flex-shrink-0
                  w-11 h-11
                  border border-(--theme-border)
                  flex items-center justify-center
                "
              >
                <Icon
                  name={method.icon}
                  size={20}
                  className="text-(--theme-text)"
                />
              </div>

              <div>
                <h3
                  className="
                    font-[Crimson_Text]
                    text-lg
                    text-(--theme-text)
                    mb-1
                  "
                >
                  {method.label}
                </h3>

                <p
                  className="
                    font-[system-ui]
                    text-sm lg:text-base
                    text-(--theme-text)
                    mb-0.5
                  "
                >
                  {method.value}
                </p>

                <p
                  className="
                    font-[system-ui]
                    text-sm
                    text-(--theme-muted)
                  "
                >
                  {method.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Response Time */}
      <div
        className="
          p-6 lg:p-7
          bg-(--theme-soft)
          border-l border-(--theme-border)
        "
      >
        <div className="flex items-start gap-4">
          <Icon
            name="ClockIcon"
            size={20}
            className="text-(--theme-text) mt-0.5"
          />

          <div>
            <h3
              className="
                font-[Crimson_Text]
                text-lg
                text-(--theme-text)
                mb-1
              "
            >
              Response Time
            </h3>

            <p
              className="
                font-[system-ui]
                text-sm
                text-(--theme-muted)
                leading-relaxed
              "
            >
              We typically respond within 24-48 hours during business days.
              For urgent matters, please call our studio during business hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectContact;
