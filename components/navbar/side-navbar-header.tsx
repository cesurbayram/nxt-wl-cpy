import { FaSwatchbook } from "react-icons/fa";

const SideNavbarHeader = () => {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 p-6 pb-4">
        <div className="relative">
          <div
            className="
            w-10 h-10 rounded-xl
            bg-gradient-to-br from-[#6950e8] to-[#8b5cf6]
            flex items-center justify-center
            shadow-lg shadow-[#6950e8]/20
            transition-all duration-300
            hover:shadow-xl hover:shadow-[#6950e8]/30
            hover:scale-105
          "
          >
            <FaSwatchbook className="w-5 h-5 text-white" />
          </div>

          <div
            className="
            absolute inset-0 w-10 h-10 rounded-xl
            bg-gradient-to-br from-[#6950e8] to-[#8b5cf6]
            blur-lg opacity-20 -z-10
            animate-pulse
          "
          ></div>
        </div>

        <div className="flex flex-col">
          <h1
            className="
            text-xl font-bold 
            bg-gradient-to-r from-[#6950e8] to-[#8b5cf6] 
            bg-clip-text text-transparent
            tracking-tight
          "
          >
            WatchLog
          </h1>
        </div>
      </div>

      <div className="relative mb-4">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
        <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-[#6950e8]/20 to-transparent"></div>
      </div>
    </div>
  );
};

export default SideNavbarHeader;
