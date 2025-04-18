"use client";
import Sidebar from "@/components/common/Sidebar";

const page = () => {
  return (
    <main className="lg:flex ">
      <div>
        <Sidebar />
      </div>
      <div className="w-full">
        Soil Results
      </div>
    </main>
  );
};

export default page;
