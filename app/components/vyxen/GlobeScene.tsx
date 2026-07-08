"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

const HUBS: [number, number][] = [
  [48.85, 2.35],   // Paris
  [51.5, -0.12],   // London
  [40.71, -74.0],  // New York
  [35.68, 139.69], // Tokyo
  [25.2, 55.27],   // Dubai
  [1.35, 103.8],   // Singapore
  [-23.55, -46.63],// São Paulo
  [6.52, 3.37],    // Lagos
  [-33.87, 151.2], // Sydney
];

function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe() {
  const group = useRef<THREE.Group>(null);
  const R = 2;

  const hubPositions = useMemo(() => HUBS.map(([lat, lng]) => latLngToVec3(lat, lng, R)), []);

  const arcs = useMemo(() => {
    const pairs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < hubPositions.length; i++) {
      const j = (i + 3) % hubPositions.length;
      pairs.push([hubPositions[i], hubPositions[j]]);
    }
    return pairs;
  }, [hubPositions]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.06;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[R, 48, 48]} />
        <meshBasicMaterial color="#0b0b18" transparent opacity={0.9} />
      </mesh>
      <mesh>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial color="#7c3aed" wireframe transparent opacity={0.12} />
      </mesh>
      {hubPositions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ))}
      {arcs.map(([a, b], i) => {
        const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.35);
        return (
          <QuadraticBezierLine
            key={i}
            start={a}
            end={b}
            mid={mid}
            color="#a78bfa"
            lineWidth={0.6}
            transparent
            opacity={0.4}
          />
        );
      })}
    </group>
  );
}

export default function GlobeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 3, 5]} intensity={1} color="#a78bfa" />
      <Globe />
    </Canvas>
  );
}
