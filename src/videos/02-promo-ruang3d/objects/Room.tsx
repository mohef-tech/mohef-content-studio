import React, { useContext } from 'react';
import { BlueprintContext, Box, Cyl } from './Primitives';

export interface RoomBuild {
    floor: number;
    back: number;
    left: number;
    details: number;
}

interface RoomProps {
    build?: Partial<RoomBuild>;
    /** warna langit di balik jendela */
    sky?: string;
    /** 0 = matahari tinggi, 1 = tenggelam (di luar jendela) */
    sunDrop?: number;
    sunColor?: string;
    /** jam untuk jam dinding (desimal, mis. 14.5) */
    clockHour?: number;
    /** 0..1 lampu strip LED di bawah rak dinding */
    ledGlow?: number;
    /** 0..1 cincin cahaya alas panggung */
    ringGlow?: number;
}

const PLANKS = [0, 1, 2, 3, 4, 5, 6, 7];

/**
 * Cangkang ruangan 4×4 m: lantai kayu, 2 dinding, jendela dengan langit,
 * pintu, karya seni dinding, jam & rak dinding.
 * Permukaan lantai berada di y = 0.1 (furnitur diletakkan di y 0.1).
 */
export const Room: React.FC<RoomProps> = ({
    build = {},
    sky = '#7dd3fc',
    sunDrop = 0,
    sunColor = '#fef9c3',
    clockHour = 10,
    ledGlow = 0,
    ringGlow = 0.6,
}) => {
    const b: RoomBuild = { floor: 1, back: 1, left: 1, details: 1, ...build };
    const bp = useContext(BlueprintContext);
    const hourAngle = -((clockHour % 12) / 12) * Math.PI * 2;
    const minuteAngle = -((clockHour % 1) * Math.PI * 2);

    return (
        <group>
            {/* ===== ALAS PANGGUNG + LANTAI KAYU ===== */}
            <group scale={[b.floor, Math.max(b.floor, 0.001), b.floor]}>
                <Box size={[4.7, 0.14, 4.7]} position={[0, -0.17, 0]} color="#0b1324" roughness={0.4} />
                {/* cincin cahaya di sekeliling alas */}
                <mesh position={[0, -0.12, 0]}>
                    <boxGeometry args={[4.76, 0.03, 4.76]} />
                    <meshBasicMaterial color="#38bdf8" transparent opacity={ringGlow * (1 - bp * 0.85)} />
                </mesh>
                {PLANKS.map((i) => (
                    <Box
                        key={i}
                        size={[4, 0.2, 0.5]}
                        position={[0, 0, -1.75 + i * 0.5]}
                        color={i % 2 === 0 ? '#c9a47e' : '#bd9670'}
                        roughness={0.85}
                    />
                ))}
            </group>

            {/* ===== DINDING BELAKANG (aksen navy) + PINTU ===== */}
            <group position={[0, 0.1, 0]} scale={[1, Math.max(b.back, 0.001), 1]}>
                <Box size={[3.8, 2.2, 0.2]} position={[0.1, 1.1, -1.9]} color="#2b4766" />
                {/* plint bawah */}
                <Box size={[3.8, 0.08, 0.04]} position={[0.1, 0.04, -1.79]} color="#0f1d30" castShadow={false} />
            </group>

            {/* ===== DINDING KIRI dengan LUBANG JENDELA ===== */}
            <group position={[0, 0.1, 0]} scale={[1, Math.max(b.left, 0.001), 1]}>
                {/* bawah jendela */}
                <Box size={[0.2, 0.7, 4]} position={[-1.9, 0.35, 0]} color="#eef2f6" />
                {/* atas jendela */}
                <Box size={[0.2, 0.4, 4]} position={[-1.9, 2.0, 0]} color="#eef2f6" />
                {/* kiri & kanan jendela */}
                <Box size={[0.2, 1.1, 1.4]} position={[-1.9, 1.25, -1.3]} color="#eef2f6" />
                <Box size={[0.2, 1.1, 0.8]} position={[-1.9, 1.25, 1.6]} color="#eef2f6" />
                <Box size={[0.04, 0.08, 4]} position={[-1.79, 0.04, 0]} color="#cbd5e1" castShadow={false} />
            </group>

            {/* ===== DETAIL: langit jendela, kusen, pintu, seni, jam, rak ===== */}
            <group scale={[1, 1, 1]} visible={b.details > 0.01}>
                <group scale={b.details} position={[0, 0, 0]}>
                    {/* Langit di luar jendela (tertutup dinding kecuali lewat lubang) */}
                    <mesh position={[-2.05, 1.35, 0.3]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[2.6, 1.8]} />
                        <meshBasicMaterial color={sky} />
                    </mesh>
                    {/* Matahari / bulan di luar */}
                    <mesh
                        position={[-2.04, 1.75 - sunDrop * 0.75, 0.7 - sunDrop * 0.5]}
                        rotation={[0, Math.PI / 2, 0]}
                    >
                        <circleGeometry args={[0.13, 24]} />
                        <meshBasicMaterial color={sunColor} />
                    </mesh>
                    {/* Kusen jendela */}
                    <Box size={[0.24, 0.05, 1.86]} position={[-1.86, 0.85, 0.3]} color="#1e293b" />
                    <Box size={[0.24, 0.05, 1.86]} position={[-1.86, 1.95, 0.3]} color="#1e293b" />
                    <Box size={[0.24, 1.1, 0.05]} position={[-1.86, 1.4, -0.6]} color="#1e293b" />
                    <Box size={[0.24, 1.1, 0.05]} position={[-1.86, 1.4, 1.2]} color="#1e293b" />
                    <Box size={[0.08, 1.1, 0.035]} position={[-1.9, 1.4, 0.3]} color="#1e293b" castShadow={false} />
                    {/* Kaca tipis */}
                    <mesh position={[-1.92, 1.4, 0.3]} rotation={[0, Math.PI / 2, 0]}>
                        <planeGeometry args={[1.8, 1.1]} />
                        <meshStandardMaterial color="#bae6fd" transparent opacity={0.12} roughness={0.1} />
                    </mesh>
                    {/* Ambang jendela */}
                    <Box size={[0.32, 0.04, 1.95]} position={[-1.72, 0.84, 0.3]} color="#f8fafc" />

                    {/* Pintu kayu + kusen + gagang */}
                    <Box size={[1.05, 1.98, 0.05]} position={[1.1, 1.09, -1.78]} color="#0f1d30" />
                    <Box size={[0.92, 1.88, 0.05]} position={[1.1, 1.05, -1.75]} color="#8b5a3c" />
                    <Box size={[0.75, 0.02, 0.02]} position={[1.1, 1.4, -1.72]} color="#6d4430" castShadow={false} />
                    <Box size={[0.75, 0.02, 0.02]} position={[1.1, 0.7, -1.72]} color="#6d4430" castShadow={false} />
                    <Box size={[0.12, 0.03, 0.05]} position={[0.75, 1.05, -1.7]} color="#fbbf24" metalness={0.8} roughness={0.3} />

                    {/* Karya seni dinding */}
                    <group position={[-0.75, 1.65, -1.78]}>
                        <Box size={[0.95, 0.62, 0.04]} color="#f8fafc" />
                        <Box size={[0.36, 0.42, 0.02]} position={[-0.2, 0, 0.025]} color="#f59e0b" castShadow={false} />
                        <Box size={[0.3, 0.28, 0.02]} position={[0.2, -0.07, 0.025]} color="#38bdf8" castShadow={false} />
                        <Cyl args={[0.08, 0.08, 0.02, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0.22, 0.16, 0.03]} color="#f43f5e" castShadow={false} />
                    </group>

                    {/* Jam dinding (jarum mengikuti clockHour) */}
                    <group position={[0.25, 1.85, -1.78]}>
                        <Cyl args={[0.17, 0.17, 0.04, 28]} rotation={[Math.PI / 2, 0, 0]} color="#f8fafc" />
                        <Cyl args={[0.18, 0.18, 0.03, 28]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} color="#0f172a" castShadow={false} />
                        <group position={[0, 0, 0.03]} rotation={[0, 0, hourAngle]}>
                            <Box size={[0.025, 0.09, 0.01]} position={[0, 0.045, 0]} color="#0f172a" castShadow={false} edges={false} />
                        </group>
                        <group position={[0, 0, 0.035]} rotation={[0, 0, minuteAngle]}>
                            <Box size={[0.016, 0.13, 0.01]} position={[0, 0.065, 0]} color="#f43f5e" castShadow={false} edges={false} />
                        </group>
                    </group>

                    {/* Rak dinding + strip LED di bawahnya */}
                    <group position={[-0.75, 1.15, -1.7]}>
                        <Box size={[1.1, 0.04, 0.2]} color="#b7865a" />
                        <Box size={[0.07, 0.18, 0.13]} position={[-0.42, 0.11, 0]} color="#0ea5e9" />
                        <Box size={[0.06, 0.15, 0.13]} position={[-0.34, 0.095, 0]} color="#f8fafc" />
                        <Box size={[0.07, 0.2, 0.13]} position={[-0.26, 0.12, 0]} color="#1e293b" />
                        <Cyl args={[0.05, 0.04, 0.1, 14]} position={[0.3, 0.07, 0]} color="#e2e8f0" />
                        <mesh position={[0, -0.025, 0.05]}>
                            <boxGeometry args={[1.05, 0.012, 0.03]} />
                            <meshBasicMaterial color="#fde68a" transparent opacity={0.15 + ledGlow * 0.85} />
                        </mesh>
                        {ledGlow > 0.01 ? (
                            <pointLight position={[0, -0.15, 0.25]} intensity={ledGlow * 1.2} distance={1.6} color="#fbbf24" />
                        ) : null}
                    </group>
                </group>
            </group>
        </group>
    );
};

