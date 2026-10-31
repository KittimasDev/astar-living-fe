import React from "react";
import { Image } from "antd";

export default function AuthLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FBFD]">
      {/* ภาพฝั่งซ้าย */}
      <div
        className="w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/auth-bg.png')" }}
      ></div>

      {/* ฟอร์มฝั่งขวา */}
      <div className="w-1/2 flex flex-col justify-center items-center px-20">
        <Image
          src="/living-logo-login.png"
          width={180}
          preview={false}
          alt="Logo"
          className="-mt-4 mb-8"
        />
        <div className="text-5xl font-bold text-[#87D2F7] -mb-16">{title}</div>
        <div className="mt-28 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
