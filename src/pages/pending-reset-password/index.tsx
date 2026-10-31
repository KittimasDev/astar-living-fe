import React from "react";
import PendingResetPassword from "../../components/auth/PendingResetPassword";

const index = () => {
  return (
    <div className="bg-[#F0F9FF]">
      <PendingResetPassword />
    </div>
  );
};

index.isAuthPage = true;

export default index;
