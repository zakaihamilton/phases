"use client";

import React, { useState, useEffect } from "react";
import Launcher from "@/sessions/Launcher";
import sessions from "@/sessions/sessions";

function getHashUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  return window?.location?.hash?.slice(1);
}

export default function Home() {
  const [hashUrl, setHashUrl] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setHashUrl(getHashUrl());

    const handleHashChange = () => {
      setHashUrl(getHashUrl());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const session = hashUrl?.split("/")[0];

  const Session = (isMounted && sessions?.find((s) => s.id === session)?.component) || Launcher;

  return <Session />;
}
