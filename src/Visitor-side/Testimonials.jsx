import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const testimonials = [
	{
		name: "Nicole Dela Cruz",
		role: "BS Psychology, UST",
		image: "/avatars/nicole.png",
		text: "TigerRoutes gave me clarity during my college apps. I didn’t even know Psychology was a perfect fit until I saw my results!",
	},
	{
		name: "Mark Reyes",
		role: "BS Computer Science, UST",
		image: "/avatars/mark.png",
		text: "I always thought I’d take Engineering, but this platform opened my eyes to Computer Science—and I love it. Big W.",
	},
	{
		name: "Jessa Tan",
		role: "BSBA Marketing Management, UST",
		image: "/avatars/jessa.png",
		text: "It really helped me understand what I’m good at, and the career paths made it way less scary to decide.",
	},
];

const Testimonials = () => {
	const prevRef = useRef(null);
	const nextRef = useRef(null);

	return (
		<section className="bg-[#ffedb7] text-[#1e1e1e] py-20 px-6 font-sfpro">
			<div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-10">
				{/* Left side */}
				<div className="lg:w-1/3">
					<h2 className="text-4xl font-black mb-4 text-[#ea9d2d]">
						Student Feedback
					</h2>
					<p className="text-lg text-[#333]">
						Your opinion matters. By providing feedback, you help us improve
						academic programs, student services, and the TigerRoutes experience.
					</p>

					<div className="flex gap-4 mt-10">
						<button
							ref={prevRef}
							className="w-10 h-10 rounded-full bg-[#ea9d2d] text-white flex items-center justify-center shadow-md hover:bg-[#d48a23] transition"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>
						<button
							ref={nextRef}
							className="w-10 h-10 rounded-full bg-[#ea9d2d] text-white flex items-center justify-center shadow-md hover:bg-[#d48a23] transition"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Right side */}
				<div className="lg:w-2/3 w-full">
					<Swiper
						modules={[Navigation]}
						spaceBetween={30}
						slidesPerView={1}
						breakpoints={{
							768: {
								slidesPerView: 2,
							},
						}}
						onBeforeInit={(swiper) => {
							if (typeof swiper.params.navigation !== "boolean") {
								swiper.params.navigation.prevEl = prevRef.current;
								swiper.params.navigation.nextEl = nextRef.current;
							}
						}}
						className="h-full"
					>
						{testimonials.map((t, index) => (
							<SwiperSlide key={index} className="h-full flex">
								<div className="bg-white p-8 rounded-xl shadow-xl relative flex flex-col h-[340px] w-full">
									{/* Stars */}
									<div className="flex gap-1 text-[#ea9d2d] mb-3 text-xl">
										{"★".repeat(5)}
									</div>
									{/* Quoted text */}
									<p className="text-xl italic leading-relaxed mb-6 text-[#333] flex-1">
										&ldquo;{t.text}&rdquo;
									</p>
									<div className="flex items-center gap-4 mt-auto">
										<img
											src={t.image}
											alt={t.name}
											className="w-12 h-12 rounded-full object-cover border-2 border-[#ea9d2d]"
										/>
										<div>
											<p className="font-semibold text-base">{t.name}</p>
											<p className="text-sm text-gray-500">{t.role}</p>
										</div>
										<div className="ml-auto text-[#fbc562] text-4xl font-serif opacity-80">
											&rdquo;
										</div>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
