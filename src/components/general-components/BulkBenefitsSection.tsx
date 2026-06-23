export default function BulkBenefitsSection() {
  const features = [
    {
      title: "Flexible Schedules",
      description: "Set your own rules. Choose daily, weekly, or custom delivery slots tailored to your operations.",
      image: "/Illustrations/Timings.svg",
    },
    {
      title: "Delivered with Care",
      description: "Hygiene-first warehousing and temperature-controlled storage ensuring farm-fresh standards.",
      image: "/Illustrations/Care.svg",
    },
    {
      title: "On-Time Dispatch",
      description: "Express same-day deliveries and reliable freight transport keeping your supply chain active.",
      image: "/Illustrations/Delivery.svg",
    },
  ];

  return (
    <section className="py-20 px-6 bg-[#FAFAF9]" id="benefits">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-50 px-3.5 py-1.5 rounded-full">
            Smart Logistics
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-4 mb-4 text-stone-900 tracking-tight">
            Bulk Orders, Smarter Benefits
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            Select delivery solutions that work perfectly for your business—from routine weekly restocks to urgent same-day express shipments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-stone-200/50 rounded-3xl p-8 text-center flex flex-col items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full"
            >
              <div className="w-full h-44 flex items-center justify-center mb-6 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="font-bold text-xl text-stone-900 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed max-w-[260px] mx-auto">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



