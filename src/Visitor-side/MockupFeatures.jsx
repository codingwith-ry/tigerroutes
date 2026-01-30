import React, { useMemo, useState } from "react";

const MockupFeatures = () => {
  const items = useMemo(
    () => [
      {
        title: "Built mobile-first for students on the go",
        body:
          "TigerRoutes works smoothly on phones, tablets, and desktops—so students can check recommendations, revisit results, and explore paths anytime, anywhere.",
        href: "#mobile",
        imageSrc: "/mockups/mobile-responsive.webp",
        imageAlt: "TigerRoutes mobile responsive preview",
      },
      {
        title: "Chatbot support for quick FAQs",
        body:
          "Got questions? The built-in chatbot helps answer common concerns about tracks, programs, and results—fast, simple, and student-friendly.",
        href: "#chatbot",
        imageSrc: "/mockups/chatbot-faq.webp",
        imageAlt: "TigerRoutes chatbot preview",
      },
      {
        title: "Homepage dashboard with analytics",
        body:
          "Your homepage shows key insights at a glance—progress, highlights, and summaries—so you always know where you stand and what to do next.",
        href: "#dashboard",
        imageSrc: "/mockups/dashboard-analytics.webp",
        imageAlt: "TigerRoutes dashboard analytics preview",
      },
      {
        title: "Access your previous assessment results anytime",
        body:
          "No need to retake the test just to remember your results. TigerRoutes saves your assessment history so you can compare, reflect, and plan better.",
        href: "#results",
        imageSrc: "/mockups/previous-results.webp",
        imageAlt: "TigerRoutes previous assessment results preview",
      },
    ],
    []
  );

  const [openIndex, setOpenIndex] = useState(2); // default open
  const active = items[Math.max(openIndex, 0)] ?? items[0];

  return (
    <section className="relative w-full bg-[#FFF9E6]">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          {/* LEFT: Accordion */}
          <div className="max-w-xl font-sfpro">

            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#1F1F1F] sm:text-4xl">
              Everything students need, right where they’ll actually use it
            </h2>

            <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-white/60 backdrop-blur">
              {items.map((item, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <div key={item.title} className="px-5">
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`text-base font-semibold transition ${
                          isOpen ? "text-[#1F1F1F]" : "text-[#1F1F1F]/70"
                        }`}
                      >
                        {item.title}
                      </span>

                      <span
                        className={`grid h-8 w-8 place-items-center rounded-full border transition ${
                          isOpen
                            ? "border-[#F5C400]/70 bg-[#F5C400]/25 text-[#1F1F1F]"
                            : "border-black/15 bg-white text-[#1F1F1F]/70"
                        }`}
                        aria-hidden="true"
                      >
                        <span className="relative block h-4 w-4">
                          <span className="absolute left-1/2 top-1/2 h-[2px] w-4 -translate-x-1/2 -translate-y-1/2 bg-current" />
                          <span
                            className={`absolute left-1/2 top-1/2 h-4 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-current transition ${
                              isOpen ? "opacity-0" : "opacity-100"
                            }`}
                          />
                        </span>
                      </span>
                    </button>

                    <div
                      className={`grid overflow-hidden transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="min-h-0">
                        <p className="text-sm leading-relaxed text-[#1F1F1F]/70">
                          {item.body}
                        </p>

                        <a
                          href={item.href}
                          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#1F1F1F] underline decoration-[#F5C400] underline-offset-4 hover:opacity-80"
                        >
                          {item.cta}
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Image */}
          <div className="relative lg:pl-6 lg:sticky lg:top-24">
            <div className="pointer-events-none absolute -inset-8 rounded-[40px] bg-[#F5C400]/25 blur-3xl" />

            <div className="relative rounded-[28px] border border-black/10 bg-white p-3 shadow-2xl shadow-[#F5C400]/25">
              <div className="aspect-square w-full max-w-[520px] overflow-hidden rounded-[22px] bg-white">
                {/* Fade swap */}
                <img
                  key={active.imageSrc}
                  src={active.imageSrc}
                  alt={active.imageAlt}
                  className="h-auto w-full select-none object-cover opacity-0 animate-fade-in"
                  draggable="false"
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 -bottom-8 mx-auto h-10 w-[70%] rounded-full bg-[#F5C400]/35 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockupFeatures;
