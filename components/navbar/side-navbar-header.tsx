import { FaSwatchbook } from "react-icons/fa";

const SideNavbarHeader = () => {
  return (
    <div className="flex items-center gap-2 p-4 py-3 border-b mb-2">
      <FaSwatchbook className="w-8 h-8 text-[#6950e8]" />
      <span className="text-xl font-semibold text-[#6950e8]">WatchLog</span>
    </div>
  );
};

export default SideNavbarHeader;
