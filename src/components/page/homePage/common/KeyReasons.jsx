"use client";

const defaultReasonData = {
  title: "KEY REASONS TO VISIT the 21st EDITION",
  description: "Every Smart Cleaning Solution you have been looking for is at our platform!",
  image: "https://images.pexels.com/photos/11213210/pexels-photo-11213210.jpeg",
  info: [
    {
      info_image: "/handshake.png",
      info_description: "Build lasting connections with 200+ industry innovators representing the cleaning industry",
      imageUrl: "/handshake.png"
    },
    {
      info_image: "/handshake.png",
      info_description: "Discover technologies and solutions that will sweep you off your feet for industrial, commercial, institutional and Government sectors",
      imageUrl: "/handshake.png"
    },
    {
      info_image: "/handshake.png",
      info_description: "Grow your expertise by associating with prestigious industry-led knowledge exchange programmes",
      imageUrl: "/handshake.png"
    },
    {
      info_image: "/handshake.png",
      info_description: "Gain first-hand knowledge of latest industry trends shaping the future of the industry",
      imageUrl: "/handshake.png"
    }
  ]
};

export default function KeyReasons({ reasonData = defaultReasonData }) {
  const data = reasonData || defaultReasonData;
  const infoItems = data.info || defaultReasonData.info;

  return (
    <>
      <section className="py-8 md:py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Title */}
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black">
              {data?.title}
            </h2>
            {data.description && (
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {data?.description}
              </p>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Image */}
            <div className="flex items-center justify-center">
              <img 
                src={data?.imageUrl || data?.image} 
                alt={data?.title || "KEY REASONS"} 
                className="max-w-full h-auto rounded-lg shadow-lg object-cover"
              />
            </div>

            {/* Right Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-12 lg:py-16 2xl:py-24">
              {infoItems?.map((item, index) => (
                <div key={item._id || index} className="flex flex-col gap-3">
                  <img 
                    src={item?.imageUrl || "/handshake.png"} 
                    className="max-w-full h-auto w-24 block" 
                    alt="icon" 
                  />
                  <h3 className="text-base lg:text-lg text-left text-zinc-800">
                    {item?.info_description}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}