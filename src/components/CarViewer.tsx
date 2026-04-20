import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

/**
 * A stylized luxury sedan built from primitives.
 * Designed to feel sculptural and on-brand — not a literal model,
 * but unmistakably a car: low silhouette, greenhouse, wheels, lights.
 */
const CarModel = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  // Materials
  const body = new THREE.MeshPhysicalMaterial({
    color: "#1a1815",
    metalness: 0.85,
    roughness: 0.25,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: "#0a0a0c",
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.6,
    transparent: true,
    opacity: 0.85,
  });
  const chrome = new THREE.MeshStandardMaterial({
    color: "#d4cfc6",
    metalness: 1,
    roughness: 0.15,
  });
  const tire = new THREE.MeshStandardMaterial({
    color: "#0a0a0a",
    roughness: 0.9,
    metalness: 0.1,
  });
  const light = new THREE.MeshStandardMaterial({
    color: "#fff8e0",
    emissive: "#fff2c4",
    emissiveIntensity: 0.4,
    metalness: 0.4,
    roughness: 0.2,
  });

  // Wheel sub-component
  const Wheel = ({ position }: { position: [number, number, number] }) => (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      <mesh material={tire} castShadow>
        <cylinderGeometry args={[0.45, 0.45, 0.32, 32]} />
      </mesh>
      <mesh material={chrome} position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 0.34, 24]} />
      </mesh>
    </group>
  );

  return (
    <group ref={group} position={[0, -0.4, 0]}>
      {/* Lower body — wide sill */}
      <mesh material={body} position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.55, 1.7]} />
      </mesh>
      {/* Hood */}
      <mesh material={body} position={[1.35, 0.7, 0]} castShadow>
        <boxGeometry args={[1.6, 0.32, 1.6]} />
      </mesh>
      {/* Trunk */}
      <mesh material={body} position={[-1.45, 0.7, 0]} castShadow>
        <boxGeometry args={[1.4, 0.32, 1.6]} />
      </mesh>
      {/* Cabin (greenhouse base) */}
      <mesh material={body} position={[-0.15, 0.95, 0]} castShadow>
        <boxGeometry args={[2.4, 0.45, 1.55]} />
      </mesh>
      {/* Glass — windshield, side, rear */}
      <mesh material={glass} position={[-0.15, 1.1, 0]}>
        <boxGeometry args={[2.2, 0.4, 1.5]} />
      </mesh>
      {/* Roof */}
      <mesh material={body} position={[-0.2, 1.32, 0]} castShadow>
        <boxGeometry args={[2.0, 0.08, 1.45]} />
      </mesh>

      {/* Chrome trim along the side */}
      <mesh material={chrome} position={[0, 0.55, 0.86]}>
        <boxGeometry args={[4.0, 0.04, 0.02]} />
      </mesh>
      <mesh material={chrome} position={[0, 0.55, -0.86]}>
        <boxGeometry args={[4.0, 0.04, 0.02]} />
      </mesh>

      {/* Front grille */}
      <mesh material={chrome} position={[2.16, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.9]} />
      </mesh>

      {/* Headlights */}
      <mesh material={light} position={[2.16, 0.65, 0.55]}>
        <boxGeometry args={[0.04, 0.12, 0.35]} />
      </mesh>
      <mesh material={light} position={[2.16, 0.65, -0.55]}>
        <boxGeometry args={[0.04, 0.12, 0.35]} />
      </mesh>

      {/* Tail lights */}
      <mesh material={new THREE.MeshStandardMaterial({ color: "#3a0a0a", emissive: "#5a1010", emissiveIntensity: 0.5 })} position={[-2.16, 0.65, 0.55]}>
        <boxGeometry args={[0.04, 0.1, 0.3]} />
      </mesh>
      <mesh material={new THREE.MeshStandardMaterial({ color: "#3a0a0a", emissive: "#5a1010", emissiveIntensity: 0.5 })} position={[-2.16, 0.65, -0.55]}>
        <boxGeometry args={[0.04, 0.1, 0.3]} />
      </mesh>

      {/* Wheels */}
      <Wheel position={[1.3, 0.05, 0.92]} />
      <Wheel position={[1.3, 0.05, -0.92]} />
      <Wheel position={[-1.3, 0.05, 0.92]} />
      <Wheel position={[-1.3, 0.05, -0.92]} />
    </group>
  );
};

const CarViewer = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [5, 2.5, 5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#EBE9E4"]} />
        <fog attach="fog" args={["#EBE9E4", 10, 22]} />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#f4f3ef" />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0} floatIntensity={0.25}>
            <CarModel />
          </Float>
          <ContactShadows
            position={[0, -0.41, 0]}
            opacity={0.55}
            scale={9}
            blur={2.4}
            far={3}
            color="#1f1e1c"
          />
          <Environment preset="city" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 2.05}
          autoRotate={false}
          rotateSpeed={0.6}
        />
      </Canvas>

      {/* Interaction hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <span className="eyebrow text-foreground/45">Drag to rotate</span>
      </div>
    </div>
  );
};

export default CarViewer;
