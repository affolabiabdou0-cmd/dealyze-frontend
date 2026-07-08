"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function Core({ speed = 1 }: { speed?: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const ring3 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.12 * speed;
    if (ring1.current) ring1.current.rotation.z += delta * 0.18 * speed;
    if (ring2.current) ring2.current.rotation.x += delta * -0.14 * speed;
    if (ring3.current) ring3.current.rotation.y += delta * 0.1 * speed;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    if (coreRef.current) coreRef.current.scale.setScalar(pulse);
  });

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.3, 4]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#5b21b6"
          emissiveIntensity={0.6}
          distort={0.35}
          speed={1.4}
          roughness={0.15}
          metalness={0.6}
        />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2.3, 0, 0]}>
        <torusGeometry args={[2.05, 0.006, 16, 128]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.35, 0.005, 16, 128]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.35} />
      </mesh>
      <mesh ref={ring3} rotation={[0, 0, Math.PI / 5]}>
        <torusGeometry args={[2.65, 0.004, 16, 128]} />
        <meshBasicMaterial color="#7c3aed" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function Particles({ count = 400 }: { count?: number }) {
  const points = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.03;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#a78bfa" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function AICoreScene({
  quality = "high",
  interactive = false,
}: {
  quality?: "low" | "mid" | "high";
  interactive?: boolean;
}) {
  const particleCount = quality === "low" ? 0 : quality === "mid" ? 180 : 400;

  return (
    <Canvas
      dpr={quality === "low" ? 1 : [1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 42 }}
      gl={{ antialias: quality !== "low", alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 5]} intensity={1.4} color="#a78bfa" />
      <pointLight position={[-4, -2, -3]} intensity={0.8} color="#22d3ee" />
      <Float speed={1.4} floatIntensity={interactive ? 0.6 : 0.3} rotationIntensity={0.15}>
        <Core speed={interactive ? 1.8 : 1} />
      </Float>
      {particleCount > 0 && <Particles count={particleCount} />}
      {quality === "high" && (
        <EffectComposer>
          <Bloom intensity={0.65} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur />
        </EffectComposer>
      )}
    </Canvas>
  );
}
