"use client";

import dynamic from "next/dynamic";
import type { HeroSceneProps } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function HeroCanvas(props: HeroSceneProps) {
  return <HeroScene {...props} />;
}
