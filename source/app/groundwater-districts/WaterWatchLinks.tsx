"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackWaterWatchEvent } from "@/lib/analytics-events";

type TrackedLinkProps = {
  href: string;
  className?: string;
  prefetch?: boolean;
  children: ReactNode;
  event: "water_watch_property_report_clicked" | "district_water_watch_clicked";
};

export function WaterWatchTrackedLink({ href, className, children, event, prefetch = true }: TrackedLinkProps) {
  return <Link prefetch={prefetch} href={href} className={className} onClick={() => trackWaterWatchEvent(event)}>{children}</Link>;
}
