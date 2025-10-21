"use client";
import ViewAll from "../../components/general-components/viewall";
import React, { useEffect, useState } from "react";
import LoginCard from "../../components/general-components/LoginCard";

export default function WebApp() {
  const [showLogin, setShowLogin] = useState(false);
  return (
    <>
      <ViewAll webapp={true} setShowLogin={setShowLogin} />
      {showLogin ? (
        <LoginCard
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={undefined}
        />
      ) : (
        <></>
      )}
    </>
  );
}