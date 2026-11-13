import React, { useEffect } from 'react';
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';

// 1. Komponen Pengatur Kamera (Zoom-in otomatis berdasarkan frame)
const CameraController: React.FC = () => {
    const frame = useCurrentFrame();
    const { camera } = useThree();

    // Di frame 0-60 kamera diam (zoom 55), lalu frame 60-110 zoom-in ke monitor (zoom 135)
    const zoomValue = interpolate(frame, [60, 110], [55, 135], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    // Geser titik fokus kamera sedikit ke atas (ke arah layar monitor) saat zoom-in
    const targetY = interpolate(frame, [60, 110], [0.5, 1.1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

    useEffect(() => {
        camera.zoom = zoomValue;
        camera.lookAt(0, targetY, 0);
        camera.updateProjectionMatrix(); // Wajib dipanggil setiap kali zoom kamera berubah
    }, [camera, zoomValue, targetY]);

    return null;
};

// 2. Scene Utama 3D Isometrik
export const IsoPromoScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Animasi muncul membal (pop-up) dengan jeda frame berbeda tiap objek
    const deskScale = spring({ frame, fps, config: { damping: 12 } });
    const monitorScale = spring({ frame: frame - 12, fps, config: { damping: 12 } });
    const serverScale = spring({ frame: frame - 24, fps, config: { damping: 12 } });

    return (
        <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
            <ThreeCanvas
                width={width}
                height={height}
                orthographic
                camera={{ position: [8, 8, 12], zoom: 55 }}
            >
                <CameraController />

                {/* Pencahayaan dasar */}
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 15, 10]} intensity={1.5} />

                {/* OBJEK 1: Meja Kerja (Posisi tengah X=0, Y=0, Z=0) */}
                <mesh position={[0, 0, 0]} scale={deskScale}>
                    {/* boxGeometry args = [Lebar (X), Tinggi (Y), Kedalaman (Z)] */}
                    <boxGeometry args={[4.5, 0.25, 2.5]} />
                    <meshStandardMaterial color="#334155" />
                </mesh>

                {/* OBJEK 2: Monitor Utama (Ditaruh di atas meja Y=1.1, agak ke belakang Z=-0.5) */}
                <group position={[0, 1.1, -0.5]} scale={monitorScale}>
                    {/* Bodi/bingkai monitor */}
                    <mesh>
                        <boxGeometry args={[2.6, 1.5, 0.12]} />
                        <meshStandardMaterial color="#1e293b" />
                    </mesh>
                    {/* Layar monitor menyala (maju sedikit di Z=0.07 supaya tidak tabrakan dengan bingkai) */}
                    <mesh position={[0, 0, 0.07]}>
                        <planeGeometry args={[2.4, 1.3]} />
                        <meshBasicMaterial color="#38bdf8" />
                    </mesh>
                </group>

                {/* OBJEK 3: Mini Server / PC di sisi kanan meja (X=1.6) */}
                <mesh position={[1.6, 0.65, 0]} scale={serverScale}>
                    <boxGeometry args={[0.7, 1.0, 1.2]} />
                    <meshStandardMaterial color="#10b981" />
                </mesh>
            </ThreeCanvas>
        </AbsoluteFill>
    );
};