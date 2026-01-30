import React from "react";

const Mockup = () => {
  return (
    <section className="relative w-full overflow-visible bg-[#FFF9E6]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#F5C400]/30 blur-3xl" />
        <div className="absolute right-[-200px] top-24 h-[520px] w-[520px] rounded-full bg-[#F5C400]/20 blur-3xl" />
        <div className="absolute bottom-[-220px] left-1/3 h-[560px] w-[560px] rounded-full bg-[#F5C400]/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 lg:py-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:pr-24">
          {/* LEFT */}
          <div className="text-[#1F1F1F] font-sfpro">
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Find the path that fits you
              <br className="hidden sm:block" />
              —and your future.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#555555] sm:text-lg">
              TigerRoutes highlights programs that match your interests and 
              strengths—so you can choose with confidence and plan your next steps.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-[#F5C400] bg-white px-6 py-3 text-sm font-semibold text-[#1F1F1F] transition hover:bg-[#FFF3BF]"
              >
                Explore TigerRoutes
              </a>
            </div>
          </div>

          {/* RIGHT: MOCKUP IMAGE */}
          <div className="relative lg:min-h-[420px]">
            <div className="relative ml-auto w-full max-w-[760px] lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-32 ">
              <div className="rounded-[28px] border border-[#F5C400]/40 bg-white p-3 shadow-xl shadow-[#F5C400]/30">
                <div className="overflow-hidden rounded-[22px] bg-white">
                  <img
                    src="/mockups/Program Results.webp"
                    alt="TigerRoutes interface preview"
                    className="w-full h-auto select-none"
                    draggable="false"
                  />
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 -bottom-8 mx-auto h-10 w-[75%] rounded-full bg-[#F5C400]/40 blur-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mockup;
