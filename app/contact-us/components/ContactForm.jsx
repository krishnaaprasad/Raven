"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";

const ContactForm = ({ className = "" }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CHANGE ---------------- */
  const handleChange = (e) => {
    if (!isHydrated) return;

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isHydrated) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulated submit (replace with API if needed)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  const subjectOptions = [
    "Fragrance Inquiry",
    "Stockist Information",
    "Craft Process Question",
    "Partnership Opportunity",
    "Press & Media",
    "General Inquiry",
  ];

  /* ---------------- SKELETON ---------------- */
  if (!isHydrated) {
    return (
      <div
        className={`bg-(--theme-bg) border border-(--theme-border) p-8 lg:p-12 ${className}`}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-12 bg-(--theme-soft)" />
          <div className="h-12 bg-(--theme-soft)" />
          <div className="h-12 bg-(--theme-soft)" />
          <div className="h-32 bg-(--theme-soft)" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-(--theme-bg) border border-(--theme-border) p-8 lg:p-12 transition-colors duration-500 ${className}`}
    >
      {/* SUCCESS */}
      {submitSuccess && (
        <div className="mb-8 p-6 border border-(--theme-border) bg-(--theme-soft) flex gap-4">
          <Icon name="CheckCircleIcon" size={22} />
          <div>
            <h3 className="font-serif text-lg text-(--theme-text)">
              Message Sent Successfully
            </h3>
            <p className="text-sm text-(--theme-muted) font-[system-ui]">
              Thank you for reaching out. We typically respond within 24–48 hours.
            </p>
          </div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6 font-[system-ui]">
        {/* NAME + EMAIL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* NAME */}
          <div>
            <label className="block text-sm text-(--theme-text) mb-2">
              Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`
                w-full px-4 py-3
                bg-(--theme-soft)
                border ${
                  errors.name
                    ? "border-red-500"
                    : "border-(--theme-border)"
                }
                text-(--theme-text)
                placeholder:text-(--theme-muted)
                focus:outline-none
                focus:border-[#b28c34]
                transition
              `}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-(--theme-text) mb-2">
              Email *
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              className={`
                w-full px-4 py-3
                bg-(--theme-soft)
                border ${
                  errors.email
                    ? "border-red-500"
                    : "border-(--theme-border)"
                }
                text-(--theme-text)
                placeholder:text-(--theme-muted)
                focus:outline-none
                focus:border-[#b28c34]
                transition
              `}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* PHONE + SUBJECT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-(--theme-text) mb-2">
              Phone
            </label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 00000 00000"
              className="
                w-full px-4 py-3
                bg-(--theme-soft)
                border border-(--theme-border)
                text-(--theme-text)
                placeholder:text-(--theme-muted)
                focus:outline-none
                focus:border-[#b28c34]
                transition
              "
            />
          </div>

          <div>
            <label className="block text-sm text-(--theme-text) mb-2">
              Subject
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="
                w-full px-4 py-3
                bg-(--theme-soft)
                border border-(--theme-border)
                text-(--theme-text)
                focus:outline-none
                focus:border-[#b28c34]
                transition
              "
            >
              <option value="">Select a subject</option>
              {subjectOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* MESSAGE */}
        <div>
          <label className="block text-sm text-(--theme-text) mb-2">
            Message *
          </label>
          <textarea
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
            placeholder="Share your thoughts, questions, or inquiries…"
            className={`
              w-full px-4 py-3 resize-none
              bg-(--theme-soft)
              border ${
                errors.message
                  ? "border-red-500"
                  : "border-(--theme-border)"
              }
              text-(--theme-text)
              placeholder:text-(--theme-muted)
              focus:outline-none
              focus:border-[#b28c34]
              transition
            `}
          />
          {errors.message && (
            <p className="mt-2 text-sm text-red-600">{errors.message}</p>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full lg:w-auto
            px-12 py-4
            border border-(--theme-border)
            text-(--theme-text)
            uppercase tracking-widest text-sm
            hover:bg-(--theme-soft)
            transition
            flex items-center justify-center gap-2
            disabled:opacity-50
          "
        >
          {isSubmitting ? (
            <>
              <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
              Sending…
            </>
          ) : (
            "Send Message"
          )}
        </button>
      </form>

      {/* FOOTNOTE */}
      <div className="mt-8 pt-8 border-t border-(--theme-border)">
        <p className="text-sm text-(--theme-muted) font-[system-ui]">
          * Required fields. We respect your privacy and never share information.
          <br />
          Expected response time: 24-48 hours on business days.
        </p>
      </div>
    </div>
  );
};

export default ContactForm;
