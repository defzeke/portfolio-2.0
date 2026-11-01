"use client";

import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import ZekeModel, { CAMERA_BASE, CAMERA_FOV, type ZekeModelProps } from "./ZekeModel";

export type HeroSceneProps = Omit<ZekeModelProps, "skipEntrance">;

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(reducedMotionQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;

export default function HeroScene(props: HeroSceneProps) {
  const reducedMotion = useSyncExternalStore(subscribe, getReducedMotion, () => false);
  // Phones: cap the render resolution lower — their pixel density is high and their GPUs small.
  const [maxDpr] = useState(() => (window.matchMedia("(max-width: 767px)").matches ? 1.4 : 1.75));

  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="size-full">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, maxDpr]}
        // near is tiny so the camera can travel right up to (and into) the mouth
        camera={{ position: CAMERA_BASE.pos.toArray(), fov: CAMERA_FOV, near: 0.005, far: 50 }}
        onCreated={({ camera }) => camera.lookAt(CAMERA_BASE.target)}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-label="3D model of Zeke"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[2.5, 4, 3]} intensity={1.6} />
        <directionalLight position={[-3, 2, -2]} intensity={0.8} color="#86efac" />

        {/* Procedural studio lighting — no external HDR download. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2} position={[0, 3, 2]} scale={[6, 2, 1]} />
          <Lightformer form="rect" intensity={1} color="#bbf7d0" position={[-4, 1, 0]} rotation-y={Math.PI / 2} scale={[4, 3, 1]} />
          <Lightformer form="rect" intensity={1} position={[4, 1, 0]} rotation-y={-Math.PI / 2} scale={[4, 3, 1]} />
        </Environment>

        <Suspense fallback={null}>
          <ZekeModel {...props} skipEntrance={reducedMotion} />
        </Suspense>

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.35}
          scale={4}
          blur={2.4}
          far={2}
          resolution={256}
          color="#14532d"
        />
      </Canvas>
    </div>
  );
}
