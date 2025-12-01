"use client";

import { SafeImage } from "@/components/common/SafeImage";
import Counter from "./Counter/Counter";

const defaultDataData = {
  title: "Our success is in our numbers",
  badges: [
    {
      value: 170,
      suffix: "+",
      label: "Exhibitors",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    },
    {
      value: 600,
      suffix: "+",
      label: "Brands",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    },
    {
      value: 60,
      suffix: "%",
      label: "Trade Visitors",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    },
    {
      value: 90,
      suffix: "+",
      label: "New Launches",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    },
    {
      value: 100,
      suffix: "+",
      label: "Eminent Speakers",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    },
    {
      value: 500,
      suffix: "%",
      label: "Delegates",
      image: "/event-icon.png",
      imageUrl: "/event-icon.png"
    }
  ]
};

export default function OurSuccess({ dataData = defaultDataData }) {
  const data = dataData || defaultDataData;
  const badges = data.badges || defaultDataData.badges;
  return (
    <>
      <section className="py-8 md:py-12 bg-no-repeat bg-cover relative before:z-2 before:w-full before:h-full before:top-0 before:left-0 before:absolute before:opacity-40 before:bg-gradient-to-b before:from-[#1f75ff] before:via-[#61daff] before:to-[#1f75ff]" style={{backgroundImage: "url('https://images.pexels.com/photos/9246494/pexels-photo-9246494.jpeg')"}}>
        <div className="container mx-auto px-2.5 relative z-10">
          {/* Section Title (optional) */}
          {data.title && (
            <div className="text-center mb-8 xl:mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">{data.title}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#1f75ff] to-[#61daff] mx-auto mt-4 rounded-full"></div>
            </div>
          )}

          {/* Badges Grid */}
          <ul className={`flex flex-wrap justify-center gap-3 xl:gap-4`}>
            {badges?.map((badge, index) => (
                <li key={badge._id || index} className="max-w-1/2 w-1/3 grow sm:max-w-1/3 sm:w-1/4 lg:max-w-1/3 lg:w-1/6 text-center flex flex-col items-center p-4 gap-2 bg-white rounded-xl">
                  {/* Badge Image Circle */}
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-[#1f75ff] to-[#61daff] p-0.5 mb-2">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <SafeImage
                        src={badge?.imageUrl || badge?.image} 
                        alt={badge?.label || "Exhibition"} 
                        className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                        placeholderSrc="/event-icon.png"
                        width={64}
                        height={64}
                      />
                    </div>
                  </div>
                  
                  {/* Badge Value */}
                  <h2 className="font-bold text-2xl lg:text-3xl 2xl:text-4xl bg-gradient-to-r from-[#1f75ff] to-[#61daff] bg-clip-text text-transparent">
                    <Counter end={badge?.value || 90} suffix={badge?.suffix || "%"} duration={3} />
                  </h2>
                  
                  {/* Badge Label */}
                  <span className="text-zinc-600 text-sm sm:text-base font-medium uppercase">{badge?.label}</span>
                </li>
              )
            )}
          </ul>
        </div>
      </section>
    </>
  );
}