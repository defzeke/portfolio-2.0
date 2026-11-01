"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { fixClips } from "./clipFixes";

const MODEL_URL = "/models/zeke_rigged_web.glb";

// How far (radians) the head/body may turn toward the cursor.
const MAX_YAW = 0.7;
const MAX_PITCH = 0.35;
const BODY_YAW = 0.25;

// DropInHi timing (seconds into the clip): he lands by ~1.4s, then waves.
// The wave plays faster and the still frames at the end are skipped.
const DROP_WAVE_FROM = 1.4;
const DROP_WAVE_SPEED = 2;
const DROP_END = 4.4;

// Reactions are cut short here (seconds) and blend back to Idle; the Talk clip runs 5s.
const REACTION_LENGTH: Partial<Record<string, number>> = { Talk: 2.6 };

// Random gestures while idle. The cursor-follow is switched off while one plays.
const GESTURES = ["LookAround", "Shrug", "Thinking", "Smirk"];
const GESTURE_DELAY: [number, number] = [6, 12]; // seconds of idle between gestures

// Blend speed between clips (per second, exponential): ~95% of a blend in ~0.43s.
const BLEND_RATE = 7;

// Camera framings (world units; the model is 1.5 tall, feet at y=0, facing +Z).
export const CAMERA_FOV = 30;
export const CAMERA_BASE = { pos: new THREE.Vector3(0, 0.95, 3.6), target: new THREE.Vector3(0, 0.82, 0) };
// Framing beside the dashboard: he stands on the bottom edge of the screen (frame bottom
// ≈ mid-thigh, head in the top fifth), so he's grounded rather than floating.
// Dollies in from `from` to `to` as the scene reveals.
const CAMERA_BUST = { y: 1.13, targetY: 1.08, from: 2.85, to: 2.6 };
// Centre of the mouth in bind pose (from the GLB's teeth/mouth bounds).
const MOUTH_BIND = new THREE.Vector3(0.016, 1.065, 0.17);

export type Reaction = "Talk" | "Laugh" | "Wave";

export type ZekeControls = {
  /** Play a one-shot reaction (interrupts a gesture; ignored if it is already playing). */
  react: (clip: Reaction) => void;
};

/** Scroll-driven camera state, tweened by GSAP from the page. */
export type ZekeRig = {
  /** 0 → 1: dive from the full-body framing into the mouth. */
  zoom: number;
  /** 0 → 1: waist-up framing beside the dashboard (takes over from `zoom` when > 0). */
  bust: number;
  /** Body yaw in radians (positive turns him toward screen-right). */
  turn: number;
  /** 0 → 1: from the dashboard framing back out to the full-body opening shot (the goodbye). */
  outro: number;
  /** Extra camera distance (world units): makes him smaller without resizing the canvas. */
  pull: number;
  /** Lowers the camera + aim (world units): moves him up the screen. */
  lift: number;
};

export type ZekeModelProps = {
  /** Start the entrance. The model stays hidden until this is true. */
  play: boolean;
  /** Skip the drop-in entrance (e.g. prefers-reduced-motion). */
  skipEntrance?: boolean;
  /** Receives imperative controls once the model is mounted. */
  controlsRef?: RefObject<ZekeControls | null>;
  /** Camera state written by the page's scroll timeline. */
  rigRef?: RefObject<ZekeRig>;
  /** Fired once the GLB is loaded. */
  onReady?: () => void;
  /** Fired when the drop-in animation has finished. */
  onEntranceComplete?: () => void;
};

type Mode = "waiting" | "entrance" | "idle" | "gesture" | "react";

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** All meshes under a named node (multi-material meshes load as a Group of meshes). */
const meshesOf = (scene: THREE.Object3D, name: string) => {
  const out: THREE.Mesh[] = [];
  scene.getObjectByName(name)?.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh);
  });
  return out;
};

export default function ZekeModel({
  play,
  skipEntrance = false,
  controlsRef,
  rigRef,
  onReady,
  onEntranceComplete,
}: ZekeModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const canvas = useThree((s) => s.gl.domElement);
  const camera = useThree((s) => s.camera);

  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  // Repair clips baked wrong in the GLB (Shrug arms, Thinking hand). Declared before the
  // animation effect so the fixes land before any action binds to these clips.
  useEffect(() => fixClips(scene, animations), [scene, animations]);
  const bones = useMemo(
    () => ({
      head: scene.getObjectByName("Head") ?? null,
      neck: scene.getObjectByName("Neck") ?? null,
    }),
    [scene],
  );

  // The GLB ships the tongue + lower teeth with `jawOpen`/`tongueOut` baked at 100%,
  // while the clips only animate the face. That pokes the tongue through the chin.
  // Keep tongueOut at 0 and drive their jawOpen from the face's jawOpen instead.
  // `minJaw` lets the scroll dive hold the mouth open.
  const syncMouth = useRef<((minJaw: number) => void) | null>(null);
  useEffect(() => {
    const withMorph = (m: THREE.Mesh) => !!m.morphTargetInfluences && !!m.morphTargetDictionary;
    const face = meshesOf(scene, "Zeke_Body").filter(withMorph);
    const followers = [...meshesOf(scene, "Tongue"), ...meshesOf(scene, "Teeth_Lower")].filter(
      withMorph,
    );
    for (const m of followers) {
      const i = m.morphTargetDictionary!.tongueOut;
      if (i !== undefined) m.morphTargetInfluences![i] = 0;
    }
    const setJaw = (m: THREE.Mesh, v: number) => {
      const i = m.morphTargetDictionary!.jawOpen;
      if (i !== undefined) m.morphTargetInfluences![i] = v;
    };
    const sync = (minJaw: number) => {
      const ref = face[0];
      const i = ref?.morphTargetDictionary!.jawOpen;
      if (!ref || i === undefined) return;
      const jaw = Math.max(ref.morphTargetInfluences![i], minJaw);
      for (const m of face) setJaw(m, jaw);
      for (const m of followers) setJaw(m, jaw);
    };
    sync(0);
    syncMouth.current = sync;
    return () => {
      syncMouth.current = null;
    };
  }, [scene]);

  // A point parented to the head bone at the mouth, so the camera can dive into it
  // wherever the animation has moved the head.
  const mouthAnchor = useRef<THREE.Object3D | null>(null);
  useEffect(() => {
    const head = bones.head as THREE.Bone | null;
    let skinned: THREE.SkinnedMesh | undefined;
    scene.traverse((o) => {
      if (!skinned && (o as THREE.SkinnedMesh).isSkinnedMesh) skinned = o as THREE.SkinnedMesh;
    });
    if (!head || !skinned) return;
    const index = skinned.skeleton.bones.indexOf(head);
    if (index < 0) return;
    const anchor = new THREE.Object3D();
    anchor.position
      .copy(MOUTH_BIND)
      .applyMatrix4(skinned.bindMatrix)
      .applyMatrix4(skinned.skeleton.boneInverses[index]);
    head.add(anchor);
    mouthAnchor.current = anchor;
    return () => {
      head.remove(anchor);
      mouthAnchor.current = null;
    };
  }, [scene, bones]);

  // Animation state, mutated from the mixer / frame loop.
  const anim = useRef({
    mode: "waiting" as Mode,
    current: null as THREE.AnimationAction | null,
    /** How much of the pose Idle currently owns (0..1). Cursor-follow scales with it. */
    idleWeight: 0,
    clock: 0,
    nextGestureAt: Infinity,
    lastGesture: "",
  });
  // Set up inside the animation effect; called by useFrame and the controls.
  const director = useRef<{
    blend: (delta: number) => void;
    tick: (allowGestures: boolean) => void;
    react: (clip: Reaction) => void;
  } | null>(null);

  // Normalised cursor offset from the model (-1..1).
  const pointer = useRef({ x: 0, y: 0 });
  const look = useRef({ yaw: 0, pitch: 0, weight: 0 });
  const tmp = useMemo(
    () => ({
      euler: new THREE.Euler(),
      quat: new THREE.Quaternion(),
      parent: new THREE.Quaternion(),
      parentInv: new THREE.Quaternion(),
      mouth: new THREE.Vector3(),
      camPos: new THREE.Vector3(),
      camTarget: new THREE.Vector3(),
      corner: new THREE.Vector3(),
    }),
    [],
  );

  // Keep latest callbacks without re-running the animation effect.
  const callbacks = useRef({ onReady, onEntranceComplete });
  useEffect(() => {
    callbacks.current = { onReady, onEntranceComplete };
  });

  useEffect(() => {
    scene.traverse((o) => {
      // skinned bounds don't follow the drop-in, so never cull the meshes
      if ((o as THREE.Mesh).isMesh) o.frustumCulled = false;
    });
    callbacks.current.onReady?.();
  }, [scene]);

  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = { react: (clip) => director.current?.react(clip) };
    return () => {
      controlsRef.current = null;
    };
  }, [controlsRef]);

  // Entrance → idle, with random gestures and on-demand reactions.
  useEffect(() => {
    if (!play) return;
    const a = anim.current;

    /*
     * Weight-managed blending (instead of three's crossFadeTo).
     * Idle always runs underneath and takes whatever weight the one-shot clips leave
     * (idle = 1 - sum of others). Overlapping transitions - e.g. Talk then Laugh a moment later
     * while scrolling - can therefore never sum below 1, which is what made the mixer blend
     * in the raw bind pose for a frame ("the model glitches").
     */
    type Layer = { act: THREE.AnimationAction; weight: number; target: number };
    let layers: Layer[] = [];

    const idleClip = THREE.AnimationClip.findByName(animations, "Idle");
    if (!idleClip) return;
    const idle = mixer.clipAction(idleClip);
    idle.setLoop(THREE.LoopRepeat, Infinity);
    idle.setEffectiveWeight(0).play();

    // Each one-shot clip keeps a small pool of actions (clip clones), so replaying a clip that
    // is still fading out starts a fresh copy instead of yanking the old one back to frame 0.
    const pools = new Map<string, THREE.AnimationAction[]>();
    const freshAction = (name: string) => {
      const clip = THREE.AnimationClip.findByName(animations, name);
      if (!clip) return null;
      const pool = pools.get(name) ?? [];
      pools.set(name, pool);
      let act = pool.find((p) => !layers.some((l) => l.act === p));
      if (!act) {
        act = mixer.clipAction(pool.length ? clip.clone() : clip);
        pool.push(act);
      }
      act.reset();
      act.setLoop(THREE.LoopOnce, 1);
      act.clampWhenFinished = true;
      act.timeScale = 1;
      act.setEffectiveWeight(0).play();
      return act;
    };

    const playOnce = (name: string, mode: Mode, instant = false) => {
      const act = freshAction(name);
      if (!act) return null;
      for (const l of layers) l.target = 0;
      layers.push({ act, weight: instant ? 1 : 0, target: 1 });
      a.current = act;
      a.mode = mode;
      return act;
    };

    const scheduleGesture = () => {
      const [min, max] = GESTURE_DELAY;
      a.nextGestureAt = skipEntrance ? Infinity : a.clock + min + Math.random() * (max - min);
    };

    const toIdle = () => {
      for (const l of layers) l.target = 0;
      a.current = idle;
      a.mode = "idle";
      scheduleGesture();
    };

    const playGesture = () => {
      const options = GESTURES.filter((g) => g !== a.lastGesture);
      const name = options[Math.floor(Math.random() * options.length)];
      a.lastGesture = name;
      if (!playOnce(name, "gesture")) scheduleGesture();
    };

    const react = (clip: Reaction) => {
      if (a.mode === "waiting" || a.mode === "entrance") return;
      if (a.mode === "react" && a.current?.getClip().name === clip) return;
      playOnce(clip, "react");
    };

    const finishEntrance = () => {
      toIdle();
      callbacks.current.onEntranceComplete?.();
    };

    // Called every frame BEFORE mixer.update: ease layer weights, Idle fills the rest.
    const blend = (delta: number) => {
      const k = 1 - Math.exp(-delta * BLEND_RATE);
      let others = 0;
      layers = layers.filter((l) => {
        l.weight += (l.target - l.weight) * k;
        if (l.target === 0 && l.weight < 0.002) {
          l.act.stop();
          return false;
        }
        l.act.setEffectiveWeight(l.weight);
        others += l.weight;
        return true;
      });
      a.idleWeight = Math.max(0, 1 - others);
      idle.setEffectiveWeight(a.idleWeight);
    };

    let drop: THREE.AnimationAction | null = null;

    // Called every frame AFTER mixer.update.
    const tick = (allowGestures: boolean) => {
      if (a.mode === "entrance" && drop) {
        if (drop.time >= DROP_WAVE_FROM) drop.timeScale = DROP_WAVE_SPEED;
        if (drop.time >= DROP_END) finishEntrance();
      } else if (a.mode === "react" && a.current) {
        const max = REACTION_LENGTH[a.current.getClip().name];
        if (max !== undefined && a.current.time >= max) toIdle();
      } else if (a.mode === "idle" && a.clock >= a.nextGestureAt) {
        if (allowGestures) playGesture();
        else scheduleGesture();
      }
    };

    // One-shot clips (gestures, reactions, or the drop if it ever reaches its end) return to idle.
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (e.action !== a.current) return;
      if (a.mode === "entrance") finishEntrance();
      else if (a.mode === "gesture" || a.mode === "react") toIdle();
    };
    mixer.addEventListener("finished", onFinished);
    director.current = { blend, tick, react };

    drop = skipEntrance ? null : playOnce("DropInHi", "entrance", true);
    if (!drop) finishEntrance();
    blend(0);

    return () => {
      mixer.removeEventListener("finished", onFinished);
      mixer.stopAllAction();
      director.current = null;
      a.mode = "waiting";
      a.current = null;
      a.nextGestureAt = Infinity;
    };
  }, [animations, mixer, play, skipEntrance]);

  useEffect(() => {
    // Measured from the model's on-screen position (canvas centre, head height),
    // normalised by the viewport so he looks at the cursor anywhere on the page.
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      pointer.current.x = clamp((e.clientX - cx) / (window.innerWidth / 2));
      pointer.current.y = clamp(-(e.clientY - cy) / (window.innerHeight / 2));
    };
    const onLeave = () => {
      pointer.current.x = 0;
      pointer.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [canvas]);

  useFrame((_, rawDelta) => {
    if (!play) return;
    const delta = Math.min(rawDelta, 0.1); // avoid jumps after tab switches
    const a = anim.current;
    const rig = rigRef?.current ?? { zoom: 0, bust: 0, turn: 0, outro: 0, pull: 0, lift: 0 };
    const diving = rig.bust === 0 && rig.zoom > 0;
    a.clock += delta;

    // 1. Animation clips write the bone poses + face morphs.
    director.current?.blend(delta);
    mixer.update(delta);
    director.current?.tick(!diving);

    // 2. Mouth interior follows the jaw; the dive opens the mouth as the camera closes in.
    syncMouth.current?.(diving ? smoothstep(0.1, 0.6, rig.zoom) * 0.9 : 0);

    // 3. Cursor follow — ONLY while idle. Any clip with its own head motion (entrance,
    //    gestures, Talk, Laugh) and the dive switch it off, or the two rotations fight.
    const following = !diving && a.mode === "idle";
    const l = look.current;
    const ease = 1 - Math.exp(-delta * 6);
    // Follow fades out at least as fast as Idle hands the pose to another clip, so the
    // look-at never stacks on top of a clip's own head motion.
    l.weight += ((following ? a.idleWeight : 0) - l.weight) * (1 - Math.exp(-delta * 8));
    if (!following) l.weight = Math.min(l.weight, a.idleWeight);
    // The body may be turned (`rig.turn`); aim the head in world terms, relative to that turn.
    l.yaw += (pointer.current.x * MAX_YAW - rig.turn - l.yaw) * ease;
    l.pitch += (-pointer.current.y * MAX_PITCH - l.pitch) * ease;

    const yaw = l.yaw * l.weight;
    const pitch = l.pitch * l.weight;

    // The rotation is defined in world space (yaw about world Y, pitch about world X)
    // and converted into the bone's local space: L' = P⁻¹ · D · P · L,
    // so it works regardless of how the rig's bone axes are oriented.
    const apply = (bone: THREE.Object3D | null, share: number) => {
      if (!bone?.parent) return;
      bone.parent.getWorldQuaternion(tmp.parent);
      tmp.euler.set(pitch * share, yaw * share, 0, "YXZ");
      tmp.quat.setFromEuler(tmp.euler);
      tmp.quat.premultiply(tmp.parentInv.copy(tmp.parent).invert()).multiply(tmp.parent);
      bone.quaternion.premultiply(tmp.quat);
    };
    apply(bones.neck, 0.4);
    apply(bones.head, 0.6);

    if (group.current) group.current.rotation.y = rig.turn + yaw * BODY_YAW;

    // 4. Camera: full body → dive into the mouth, or the waist-up framing by the dashboard.
    const { camPos, camTarget, mouth } = tmp;
    if (rig.bust > 0) {
      const d = THREE.MathUtils.lerp(CAMERA_BUST.from, CAMERA_BUST.to, rig.bust);
      camPos.set(0, CAMERA_BUST.y, d);
      camTarget.set(0, CAMERA_BUST.targetY, 0);
      if (rig.outro > 0) {
        camPos.lerp(CAMERA_BASE.pos, rig.outro);
        camTarget.lerp(CAMERA_BASE.target, rig.outro);
      }
    } else if (rig.zoom > 0 && mouthAnchor.current) {
      mouthAnchor.current.getWorldPosition(mouth);
      // Centre the mouth early, then travel the rest of the way to just behind the lips.
      camTarget.lerpVectors(CAMERA_BASE.target, mouth, smoothstep(0, 0.45, rig.zoom));
      mouth.setZ(mouth.z - 0.03);
      camPos.lerpVectors(CAMERA_BASE.pos, mouth, rig.zoom);
    } else {
      camPos.copy(CAMERA_BASE.pos);
      camTarget.copy(CAMERA_BASE.target);
    }
    // Phone framings: pull back and lift instead of resizing the canvas (a resize glitches).
    if (rig.pull || rig.lift) {
      camPos.add(tmp.corner.set(0, -rig.lift, rig.pull));
      camTarget.setY(camTarget.y - rig.lift);
    }
    camera.position.copy(camPos);
    camera.lookAt(camTarget);
  });

  return (
    <group ref={group} visible={play} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload(MODEL_URL);
