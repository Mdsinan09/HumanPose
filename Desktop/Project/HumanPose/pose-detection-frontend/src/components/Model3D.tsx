import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

interface Props {
  url: string;
  color?: string;
}

export default function Model3D({ url, color = "#a0e8ff" }: Props) {
  const { scene } = useGLTF(url, true);

  useEffect(() => {
    scene.traverse((obj: any) => {
      if (obj.isMesh && obj.material) {
        obj.material.color.set(color);
        obj.material.needsUpdate = true;
      }
    });
  }, [scene, color]);

  return <primitive object={scene} scale={0.07} position={[0, -5, 0]} rotation={[0, Math.PI, 0]} />;
}

// Preload models
useGLTF.preload("/models/ybot.glb");
useGLTF.preload("/models/xbot.glb");