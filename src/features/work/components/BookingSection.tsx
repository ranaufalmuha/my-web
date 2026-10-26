"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

export const BookingSection = () => {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "30min" });
      cal("ui", { theme: "dark", hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  return (
    <section id="booking" className="bg-surface border-y border-white/10">
      <div className="relative h-[700px] w-full bg-surface">
        <div className="absolute inset-0 grid place-items-center">
          <p className="animate-pulse font-ibm-plex-mono text-sm tracking-widest text-paragraph">
            LOADING CALENDAR...
          </p>
        </div>
        <div className="relative z-10 h-full w-full">
          <Cal
            namespace="30min"
            calLink="ranaufal-muha-psrr6g/30min"
            style={{ width: "100%", height: "100%", overflow: "scroll" }}
            config={{ layout: "month_view", useSlotsViewOnSmallScreen: "true" }}
          />
        </div>
      </div>
    </section>
  );
};
