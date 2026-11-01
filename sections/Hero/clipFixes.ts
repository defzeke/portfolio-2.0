import * as THREE from "three";

export function fixClips(scene: THREE.Object3D, animations: THREE.AnimationClip[]) {
  const thinking = THREE.AnimationClip.findByName(animations, "Thinking");
  const shrug = THREE.AnimationClip.findByName(animations, "Shrug");
  const idle = THREE.AnimationClip.findByName(animations, "Idle");
  if (thinking && !thinking.userData.fixed) {
    fixThinkingHand(scene, thinking);
    thinking.userData.fixed = true;
  }
  if (shrug && idle && !shrug.userData.fixed) {
    addShrugArms(scene, shrug, idle);
    shrug.userData.fixed = true;
  }
}

const bone = (scene: THREE.Object3D, name: string) => scene.getObjectByName(name) ?? null;

function fixThinkingHand(scene: THREE.Object3D, clip: THREE.AnimationClip) {
  const hand = bone(scene, "RightHand");
  const middle = bone(scene, "RightHandMiddle1");
  const track = clip.tracks.find((t) => t.name === "RightHand.quaternion");
  if (!hand || !middle || !track) return;
  // The hand's long axis in its own space points at the middle-finger root.
  const axis = middle.position.clone().normalize();
  const twist = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
  const q = new THREE.Quaternion();
  const v = track.values;
  for (let i = 0; i < v.length; i += 4) {
    q.fromArray(v, i).multiply(twist).toArray(v, i);
  }
}

function addShrugArms(scene: THREE.Object3D, shrug: THREE.AnimationClip, idle: THREE.AnimationClip) {
  // Pose the skeleton in Idle so world-space directions are measured from the real start pose.
  const mixer = new THREE.AnimationMixer(scene);
  mixer.clipAction(idle).play();
  mixer.update(0);
  scene.updateMatrixWorld(true);

  const D = shrug.duration;
  const times = [0, 0.4, D - 0.85, D - 0.35, D];
  const tracks: THREE.KeyframeTrack[] = [];

  for (const side of ["Left", "Right"] as const) {
    const s = side === "Left" ? 1 : -1; // model faces +Z, so his left is +X
    const upper = bone(scene, `${side}Arm`);
    const fore = bone(scene, `${side}ForeArm`);
    const hand = bone(scene, `${side}Hand`);
    const middle = bone(scene, `${side}HandMiddle1`);
    const index = bone(scene, `${side}HandIndex1`);
    const pinky = bone(scene, `${side}HandPinky1`);
    const thumb = bone(scene, `${side}HandThumb1`);
    if (!upper?.parent || !fore || !hand || !middle || !index || !pinky || !thumb) continue;

    const worldQ = (o: THREE.Object3D) => o.getWorldQuaternion(new THREE.Quaternion());
    const parentQ = worldQ(upper.parent);

    // Upper arm: hangs down, a little out and forward.
    const upperW = worldQ(upper);
    const upperDir = fore.position.clone().normalize().applyQuaternion(upperW);
    const upperTarget = new THREE.Vector3(0.32 * s, -1, 0.18).normalize();
    const newUpperW = new THREE.Quaternion().setFromUnitVectors(upperDir, upperTarget).multiply(upperW);

    // Forearm: out to the side and forward, slightly raised.
    const foreW = newUpperW.clone().multiply(fore.quaternion);
    const foreDir = hand.position.clone().normalize().applyQuaternion(foreW);
    const foreTarget = new THREE.Vector3(0.62 * s, 0.08, 0.78).normalize();
    const newForeW = new THREE.Quaternion().setFromUnitVectors(foreDir, foreTarget).multiply(foreW);

    // Hand: continues the forearm, palm facing up.
    const long = middle.position.clone().normalize();
    const across = index.position.clone().sub(pinky.position).normalize();
    const palm = new THREE.Vector3().crossVectors(long, across).normalize();
    if (palm.dot(thumb.position) < 0) palm.negate(); // the thumb sits on the palm side
    palm.sub(long.clone().multiplyScalar(palm.dot(long))).normalize();
    const src = new THREE.Matrix4().makeBasis(long, palm, new THREE.Vector3().crossVectors(long, palm));
    const tLong = foreTarget.clone();
    const tPalm = new THREE.Vector3(0, 1, 0).sub(tLong.clone().multiplyScalar(tLong.y)).normalize();
    const dst = new THREE.Matrix4().makeBasis(tLong, tPalm, new THREE.Vector3().crossVectors(tLong, tPalm));
    const handW = new THREE.Quaternion().setFromRotationMatrix(dst.multiply(src.transpose()));

    const local = (world: THREE.Quaternion, parentWorld: THREE.Quaternion) =>
      parentWorld.clone().invert().multiply(world);
    const shrugPose = {
      upper: local(newUpperW, parentQ),
      fore: local(newForeW, newUpperW),
      hand: local(handW, newForeW),
    };
    const restPose = { upper: upper.quaternion.clone(), fore: fore.quaternion.clone(), hand: hand.quaternion.clone() };

    const keys = (a: THREE.Quaternion, b: THREE.Quaternion) =>
      [a, b, b, a, a].flatMap((q) => q.toArray() as number[]);
    tracks.push(
      new THREE.QuaternionKeyframeTrack(`${side}Arm.quaternion`, times, keys(restPose.upper, shrugPose.upper)),
      new THREE.QuaternionKeyframeTrack(`${side}ForeArm.quaternion`, times, keys(restPose.fore, shrugPose.fore)),
      new THREE.QuaternionKeyframeTrack(`${side}Hand.quaternion`, times, keys(restPose.hand, shrugPose.hand)),
      // Hands come out of the pockets (scale up) as the forearms swing out, and back in.
      new THREE.VectorKeyframeTrack(
        `${side}Hand.scale`,
        [0, 0.12, 0.34, D - 0.6, D - 0.38, D],
        [0.001, 0.001, 1, 1, 0.001, 0.001].flatMap((k) => [k, k, k]),
      ),
    );
  }

  mixer.stopAllAction();
  mixer.uncacheRoot(scene);

  const replaced = new Set(tracks.map((t) => t.name));
  shrug.tracks = [...shrug.tracks.filter((t) => !replaced.has(t.name)), ...tracks];
  shrug.resetDuration();
}
