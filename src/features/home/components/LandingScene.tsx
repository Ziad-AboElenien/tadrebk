'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { heroPointer, heroScroll } from './landing-hero-state';

/* ------------------------------------------------------------------ */
/* Local palette (mirrors the CSS brand tokens)                        */
/* ------------------------------------------------------------------ */
const GREEN_400 = '#34d399';
const GREEN_500 = '#10b981';
const GREEN_600 = '#059669';
const MINT_100 = '#d1fae5';
const INK_900 = '#0b1220';
const INK_800 = '#111827';
// Polished accent gems — three of them, small, out wide (<5% of any view)
const ACCENTS = ['#8b5cf6', '#f59e0b', '#f43f5e'];

const ICO_COUNT = 15;
const OCT_COUNT = 10;

/* ------------------------------------------------------------------ */
/* Scattering: keeps instances out of the copy zone                    */
/* ------------------------------------------------------------------ */
type ScatterItem = {
  pos: [number, number, number];
  scale: number;
  rot: [number, number, number];
  speed: number;
  phase: number;
  color: THREE.Color;
};

function scatter(minR: number, spreadR: number) {
  const angle = Math.random() * Math.PI * 2;
  const radius = minR + Math.random() * spreadR;
  const x0 = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius * 0.62 - 1.2;
  const y0 = (Math.random() - 0.5) * 3.0;
  // elliptical keep-out over the headline + sub copy
  const cy = 0.6;
  let ex = x0;
  let ey = y0 - cy;
  const d = Math.hypot(ex / 3.2, ey / 2.3);
  if (d < 1) {
    const k = 1 / (d || 0.001);
    ex *= k;
    ey *= k;
  }
  return { x: ex, y: ey + cy, z };
}

/** Tonal jitter per instance: one palette, many subtle shades. */
function jitter(hex: string) {
  return new THREE.Color(hex).multiplyScalar(0.88 + Math.random() * 0.24);
}

function makeItems(
  count: number,
  palette: string[],
  minR: number,
  spreadR: number,
  minScale: number,
  maxScale: number
): ScatterItem[] {
  return Array.from({ length: count }, () => {
    const { x, y, z } = scatter(minR, spreadR);
    return {
      pos: [x, y, z],
      scale: minScale + Math.random() * (maxScale - minScale),
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      speed: 0.16 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2,
      color: jitter(palette[Math.floor(Math.random() * palette.length)]),
    };
  });
}

/* ------------------------------------------------------------------ */
/* Stylized low-poly graduation cap                                    */
/* ------------------------------------------------------------------ */
function GradCap() {
  const group = useRef<THREE.Group>(null);
  const tassel = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = 0.6 + t * 0.16;
      group.current.position.y = 0.15 + Math.sin(t * 0.55) * 0.2;
      group.current.rotation.z = Math.sin(t * 0.4) * 0.035;
      // tilts gently away as the visitor scrolls out of the hero
      group.current.rotation.x = -heroScroll.p * 0.3;
    }
    if (tassel.current) {
      tassel.current.rotation.z = Math.sin(t * 1.0) * 0.14;
      tassel.current.rotation.x = Math.cos(t * 0.8) * 0.09;
    }
  });

  return (
    <group ref={group}>
      {/* crown */}
      <mesh position={[0, -0.42, 0]}>
        <cylinderGeometry args={[0.82, 1.08, 0.95, 8]} />
        <meshStandardMaterial color={INK_900} flatShading roughness={0.45} metalness={0.25} />
      </mesh>
      {/* green band — softly self-lit so it reads as brand, not paint */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.84, 0.84, 0.12, 8]} />
        <meshStandardMaterial
          color={GREEN_500}
          flatShading
          roughness={0.35}
          emissive={GREEN_500}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* mortar board */}
      <mesh position={[0, 0.28, 0]} rotation={[0.06, 0, 0.05]}>
        <boxGeometry args={[2.55, 0.14, 2.55]} />
        <meshStandardMaterial color={INK_800} flatShading roughness={0.42} metalness={0.3} />
      </mesh>
      {/* button */}
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.12, 8]} />
        <meshStandardMaterial color={GREEN_400} flatShading roughness={0.3} metalness={0.4} />
      </mesh>
      {/* tassel */}
      <group ref={tassel} position={[1.02, 0.38, 0.55]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.75, 6]} />
          <meshStandardMaterial color={GREEN_400} roughness={0.35} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.78, 0]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <meshStandardMaterial color={GREEN_400} roughness={0.25} metalness={0.55} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Drifting low-poly "career lattice" — icosahedra + octahedra         */
/* ------------------------------------------------------------------ */
function Lattice() {
  const meshIco = useRef<THREE.InstancedMesh>(null);
  const meshOct = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { viewport } = useThree();
  // On narrow screens the copy fills the viewport — no safe zone for drifters.
  const hidden = viewport.width < 7;

  const icoItems = useMemo(
    () =>
      makeItems(
        ICO_COUNT,
        [GREEN_400, GREEN_500, GREEN_600, MINT_100, '#a7f3d0', '#99f6e4'],
        3.6,
        3.6,
        0.09,
        0.27
      ),
    []
  );
  const octItems = useMemo(
    () =>
      makeItems(
        OCT_COUNT,
        [GREEN_400, GREEN_500, '#a7f3d0', '#6ee7b7', MINT_100],
        4.0,
        3.2,
        0.08,
        0.22
      ),
    []
  );

  useEffect(() => {
    const pairs: [{ current: THREE.InstancedMesh | null }, ScatterItem[]][] = [
      [meshIco, icoItems],
      [meshOct, octItems],
    ];
    pairs.forEach(([ref, items]) => {
      const m = ref.current;
      if (!m) return;
      items.forEach((it, i) => m.setColorAt(i, it.color));
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    });
  }, [icoItems, octItems]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = group.current;
    const mi = meshIco.current;
    const mo = meshOct.current;
    if (!g || !mi || !mo) return;

    // gentle sway only — no orbital rotation, or instances would drift
    // back into the copy keep-out zone
    g.position.x = Math.sin(t * 0.1) * 0.18;
    // gentle parallax as the user scrolls away from the hero
    g.position.y = heroScroll.p * 1.8;

    const update = (m: THREE.InstancedMesh, items: ScatterItem[]) => {
      items.forEach((it, i) => {
        dummy.position.set(
          it.pos[0],
          it.pos[1] + Math.sin(t * it.speed + it.phase) * 0.22,
          it.pos[2]
        );
        dummy.rotation.set(
          it.rot[0] + t * 0.08 * it.speed,
          it.rot[1] + t * 0.11 * it.speed,
          0
        );
        dummy.scale.setScalar(it.scale);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    };
    update(mi, icoItems);
    update(mo, octItems);
  });

  if (hidden) return null;

  return (
    <group ref={group}>
      <instancedMesh
        ref={meshIco}
        args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, ICO_COUNT]}
        frustumCulled={false}
      >
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.35} metalness={0.12} />
      </instancedMesh>
      <instancedMesh
        ref={meshOct}
        args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, OCT_COUNT]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.3} metalness={0.15} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Accent gems — metallic, faintly self-lit                            */
/* ------------------------------------------------------------------ */
function Gem({ color, item, phase }: { color: string; item: ScatterItem; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const m = ref.current;
    if (!m) return;
    m.position.y = item.pos[1] + Math.sin(t * item.speed + phase) * 0.26;
    m.rotation.y = t * 0.35 + phase;
    m.rotation.x = Math.sin(t * 0.3 + phase) * 0.4;
  });
  return (
    <mesh ref={ref} position={item.pos} scale={item.scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.22}
        emissive={color}
        emissiveIntensity={0.25}
        flatShading
      />
    </mesh>
  );
}

function Gems() {
  const { viewport } = useThree();
  const gems = useMemo(
    () =>
      ACCENTS.map((color) => ({
        color,
        item: makeItems(1, [color], 4.4, 2.6, 0.1, 0.15)[0],
      })),
    []
  );
  if (viewport.width < 7) return null;
  return (
    <>
      {gems.map((g, i) => (
        <Gem key={g.color} color={g.color} item={g.item} phase={i * 2.1} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Camera rig: lerps toward the cursor and drives the demand loop      */
/* ------------------------------------------------------------------ */
function Rig({ active }: { active: boolean }) {
  const { camera, invalidate } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 9), []);

  useFrame(() => {
    if (!active) return; // loop goes to sleep until something wakes it up

    target.set(heroPointer.x * 0.28, heroPointer.y * 0.18, 9);
    camera.position.lerp(target, 0.08);
    camera.lookAt(0, 0, 0);

    invalidate();
  });

  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  return null;
}

/** Scene layout that adapts to viewport width (narrow screens: no cap at all). */
function Centerpiece() {
  const { viewport } = useThree();
  const wide = viewport.width > 7;
  if (!wide) return null;
  return (
    <group position={[3.4, -0.95, -2.2]} scale={0.92}>
      <GradCap />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Canvas                                                              */
/* ------------------------------------------------------------------ */

/** Fires once after the first rendered frame, so the DOM layer can fade the scene in. */
function FirstFrame({ onShown }: { onShown: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (!fired.current) {
      fired.current = true;
      onShown();
    }
  });
  return null;
}

export default function Scene({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let inView = true;
    const evaluate = () => setActive(inView && !document.hidden);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        evaluate();
      },
      { threshold: 0.02 }
    );
    io.observe(el);
    document.addEventListener('visibilitychange', evaluate);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', evaluate);
    };
  }, [heroRef]);

  return (
    <div className={`hero__scene${shown ? ' is-in' : ''}`}>
      {/* atmosphere: soft brand halo + grounding shadow under the cap */}
      <span className="hero__glow" aria-hidden="true" />
      <span className="hero__cap-shadow" aria-hidden="true" />
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: 42, position: [0, 0, 9], near: 0.1, far: 40 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <fog attach="fog" args={['#e8f8f1', 8, 18]} />
        <ambientLight intensity={0.65} />
        <hemisphereLight args={['#d1fae5', '#ffffff', 0.55]} />
        <directionalLight position={[3, 5, 4]} intensity={2.0} />
        <directionalLight position={[-4, 1, -4]} intensity={0.9} color={GREEN_400} />
        <Centerpiece />
        <Lattice />
        <Gems />
        <Rig active={active} />
        <FirstFrame onShown={() => setShown(true)} />
      </Canvas>
    </div>
  );
}

