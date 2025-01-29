import Image from "next/image";

const SideNavbarHeader = () => {
  return (
    <div className="flex items-center p-4">
      <Image src={"/yaskawa-logo.png"} alt="logo" width={100} height={100} />
    </div>
  );
};

export default SideNavbarHeader;
