import React from 'react';
import { Box, Cyl, Ico } from './Primitives';

/* Semua furnitur: titik nol = permukaan lantai, depan menghadap +Z. */

const WOOD = '#b7865a';
const METAL = '#1e293b';

export const Chair: React.FC<{ color?: string }> = ({ color = '#334155' }) => (
    <group>
        {/* kaki bintang 5 */}
        {[0, 1, 2, 3, 4].map((i) => (
            <Box
                key={i}
                size={[0.03, 0.03, 0.24]}
                position={[Math.sin((i * 2 * Math.PI) / 5) * 0.11, 0.04, Math.cos((i * 2 * Math.PI) / 5) * 0.11]}
                rotation={[0, (i * 2 * Math.PI) / 5, 0]}
                color={METAL}
                castShadow={false}
            />
        ))}
        <Cyl args={[0.03, 0.03, 0.36, 10]} position={[0, 0.22, 0]} color={METAL} />
        <Box size={[0.46, 0.08, 0.44]} position={[0, 0.42, 0]} color={color} />
        <Box size={[0.44, 0.5, 0.07]} position={[0, 0.72, -0.2]} rotation={[-0.1, 0, 0]} color={color} />
        <Box size={[0.04, 0.04, 0.3]} position={[-0.24, 0.56, 0]} color={METAL} />
        <Box size={[0.04, 0.04, 0.3]} position={[0.24, 0.56, 0]} color={METAL} />
    </group>
);

interface DeskProps {
    /** 0..1 terang layar monitor */
    screen?: number;
    /** tampilkan kursi di belakang meja */
    withChair?: boolean;
    /** 0..1 lampu meja menyala */
    lamp?: number;
}

export const Desk: React.FC<DeskProps> = ({ screen = 1, withChair = true, lamp = 0 }) => (
    <group>
        {/* daun meja & rangka besi */}
        <Box size={[1.45, 0.06, 0.72]} position={[0, 0.72, 0]} color={WOOD} roughness={0.6} />
        {[-0.66, 0.66].map((x) => (
            <group key={x}>
                <Box size={[0.05, 0.69, 0.05]} position={[x, 0.345, 0.3]} color={METAL} />
                <Box size={[0.05, 0.69, 0.05]} position={[x, 0.345, -0.3]} color={METAL} />
                <Box size={[0.05, 0.05, 0.6]} position={[x, 0.06, 0]} color={METAL} castShadow={false} />
            </group>
        ))}

        {/* monitor + layar yang "menampilkan" denah 3D */}
        <group position={[-0.1, 0.75, -0.18]}>
            <Box size={[0.2, 0.02, 0.14]} position={[0, 0.01, 0]} color={METAL} />
            <Box size={[0.04, 0.22, 0.04]} position={[0, 0.12, -0.02]} color={METAL} />
            <Box size={[0.72, 0.42, 0.04]} position={[0, 0.42, 0]} color="#0b1220" />
            <mesh position={[0, 0.42, 0.022]}>
                <planeGeometry args={[0.66, 0.36]} />
                <meshBasicMaterial color="#0c2a4a" transparent opacity={0.4 + screen * 0.6} />
            </mesh>
            <mesh position={[-0.12, 0.44, 0.024]} rotation={[0, 0, Math.PI / 4]}>
                <planeGeometry args={[0.16, 0.16]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={screen} />
            </mesh>
            <mesh position={[0.17, 0.5, 0.024]}>
                <planeGeometry args={[0.22, 0.04]} />
                <meshBasicMaterial color="#34d399" transparent opacity={screen} />
            </mesh>
            <mesh position={[0.17, 0.43, 0.024]}>
                <planeGeometry args={[0.22, 0.03]} />
                <meshBasicMaterial color="#64748b" transparent opacity={screen} />
            </mesh>
            <mesh position={[0.17, 0.37, 0.024]}>
                <planeGeometry args={[0.16, 0.03]} />
                <meshBasicMaterial color="#fbbf24" transparent opacity={screen} />
            </mesh>
        </group>

        {/* keyboard, mouse, mug, buku */}
        <Box size={[0.42, 0.02, 0.13]} position={[-0.1, 0.76, 0.12]} color="#e2e8f0" castShadow={false} />
        <Box size={[0.06, 0.02, 0.09]} position={[0.2, 0.76, 0.12]} color="#e2e8f0" castShadow={false} />
        <group position={[0.42, 0.75, 0.15]}>
            <Cyl args={[0.045, 0.04, 0.1, 16]} position={[0, 0.05, 0]} color="#f8fafc" />
            <Cyl args={[0.04, 0.04, 0.005, 16]} position={[0, 0.098, 0]} color="#5b3a1e" castShadow={false} />
        </group>
        <Box size={[0.22, 0.04, 0.3]} position={[-0.52, 0.77, 0.08]} rotation={[0, 0.25, 0]} color="#f43f5e" />
        <Box size={[0.2, 0.03, 0.28]} position={[-0.52, 0.805, 0.08]} rotation={[0, 0.1, 0]} color="#f8fafc" />

        {/* lampu meja */}
        <DeskLamp position={[0.55, 0.75, -0.2]} on={lamp} />

        {withChair ? (
            <group position={[-0.1, 0, 0.55]} rotation={[0, Math.PI, 0]}>
                <Chair />
            </group>
        ) : null}
    </group>
);

export const DeskLamp: React.FC<{ position?: [number, number, number]; on?: number }> = ({
    position,
    on = 0,
}) => (
    <group position={position}>
        <Cyl args={[0.07, 0.08, 0.02, 16]} position={[0, 0.01, 0]} color={METAL} />
        <Box size={[0.02, 0.32, 0.02]} position={[0, 0.17, 0]} rotation={[0, 0, 0.15]} color={METAL} />
        <Box size={[0.02, 0.2, 0.02]} position={[-0.06, 0.38, 0.05]} rotation={[0.9, 0, 0]} color={METAL} />
        <Cyl
            args={[0.04, 0.1, 0.12, 18]}
            position={[-0.06, 0.4, 0.14]}
            rotation={[0.5, 0, 0]}
            color="#fef3c7"
            emissive="#fbbf24"
            emissiveIntensity={0.1 + on * 2.5}
        />
        {on > 0.01 ? (
            <pointLight position={[-0.06, 0.25, 0.25]} intensity={on * 2.6} distance={2.6} decay={1.4} color="#fbbf24" />
        ) : null}
    </group>
);

export const Bookshelf: React.FC = () => {
    const books: Array<[number, number, string]> = [
        [-0.17, 0.2, '#38bdf8'],
        [-0.1, 0.17, '#f8fafc'],
        [-0.03, 0.22, '#1e293b'],
        [0.06, 0.18, '#f59e0b'],
        [0.14, 0.2, '#0ea5e9'],
    ];
    return (
        <group>
            <Box size={[0.04, 1.5, 0.36]} position={[-0.26, 0.75, 0]} color={METAL} />
            <Box size={[0.04, 1.5, 0.36]} position={[0.26, 0.75, 0]} color={METAL} />
            {[0.04, 0.42, 0.8, 1.18, 1.5].map((y) => (
                <Box key={y} size={[0.56, 0.035, 0.36]} position={[0, y, 0]} color={WOOD} />
            ))}
            {books.map(([x, h, c], i) => (
                <Box key={`a${i}`} size={[0.06, h, 0.26]} position={[x, 0.44 + h / 2 + 0.02, 0.02]} color={c} />
            ))}
            {books.slice(0, 3).map(([x, h, c], i) => (
                <Box key={`b${i}`} size={[0.06, h, 0.26]} position={[x + 0.1, 1.2 + h / 2 + 0.02, 0.02]} color={c} />
            ))}
            <Box size={[0.32, 0.26, 0.28]} position={[0, 0.2, 0.02]} color="#e2e8f0" />
            <Ico radius={0.09} position={[-0.12, 0.92, 0]} color="#22c55e" />
            <Cyl args={[0.06, 0.05, 0.1, 12]} position={[-0.12, 0.87, 0]} color="#f8fafc" />
        </group>
    );
};

export const Sofa: React.FC<{ color?: string; accent?: string }> = ({
    color = '#0369a1',
    accent = '#0ea5e9',
}) => (
    <group>
        <Box size={[1.36, 0.2, 0.62]} position={[0, 0.16, 0]} color={color} />
        {[-0.31, 0.31].map((x) => (
            <Box key={x} size={[0.6, 0.1, 0.5]} position={[x, 0.31, 0.04]} color={accent} roughness={0.95} />
        ))}
        <Box size={[1.36, 0.42, 0.16]} position={[0, 0.42, -0.23]} color={color} />
        <Box size={[0.14, 0.36, 0.62]} position={[-0.68, 0.3, 0]} color={color} />
        <Box size={[0.14, 0.36, 0.62]} position={[0.68, 0.3, 0]} color={color} />
        {/* bantal aksen */}
        <Box size={[0.28, 0.24, 0.08]} position={[-0.42, 0.48, -0.1]} rotation={[-0.2, 0.2, 0.1]} color="#f59e0b" />
        <Box size={[0.26, 0.22, 0.08]} position={[0.44, 0.47, -0.1]} rotation={[-0.2, -0.25, -0.1]} color="#f8fafc" />
        {/* kaki */}
        {[-0.6, 0.6].map((x) => (
            <Cyl key={x} args={[0.025, 0.02, 0.06, 8]} position={[x, 0.03, 0.22]} color={METAL} castShadow={false} />
        ))}
    </group>
);

export const CoffeeTable: React.FC = () => (
    <group>
        <Cyl args={[0.3, 0.3, 0.04, 28]} position={[0, 0.34, 0]} color="#f1f5f9" roughness={0.25} />
        <Cyl args={[0.04, 0.12, 0.32, 14]} position={[0, 0.16, 0]} color={METAL} />
        <Box size={[0.2, 0.03, 0.15]} position={[-0.08, 0.375, 0.02]} rotation={[0, 0.4, 0]} color="#0ea5e9" />
        <Cyl args={[0.035, 0.03, 0.07, 12]} position={[0.12, 0.395, -0.05]} color="#f59e0b" />
    </group>
);

export const Rug: React.FC<{ size?: [number, number] }> = ({ size = [1.5, 1.3] }) => (
    <group>
        <Box size={[size[0], 0.015, size[1]]} position={[0, 0.008, 0]} color="#e7dccb" castShadow={false} />
        <Box size={[size[0] - 0.2, 0.017, size[1] - 0.2]} position={[0, 0.009, 0]} color="#475569" castShadow={false} />
    </group>
);

/** Sofa + meja kopi + karpet sebagai satu area tamu. Depan sofa = +Z. */
export const Lounge: React.FC = () => (
    <group>
        <group position={[0, 0, 0.3]}>
            <Rug />
        </group>
        <Sofa />
        <group position={[0, 0, 0.72]}>
            <CoffeeTable />
        </group>
    </group>
);

export const Plant: React.FC<{ tall?: boolean }> = ({ tall = false }) => (
    <group>
        <Cyl args={[0.17, 0.13, 0.36, 18]} position={[0, 0.18, 0]} color="#e7dccb" roughness={0.9} />
        <Cyl args={[0.16, 0.16, 0.02, 18]} position={[0, 0.35, 0]} color="#3f2d1e" castShadow={false} />
        {tall ? (
            <>
                <Box size={[0.03, 0.6, 0.03]} position={[0, 0.65, 0]} color="#5b3a1e" />
                <Ico radius={0.26} position={[0, 1.05, 0]} color="#16a34a" />
                <Ico radius={0.2} position={[0.14, 0.86, 0.08]} rotation={[0.4, 0.3, 0]} color="#22c55e" />
                <Ico radius={0.18} position={[-0.13, 0.9, -0.06]} rotation={[0.2, 0.8, 0]} color="#15803d" />
            </>
        ) : (
            <>
                <Ico radius={0.2} position={[0, 0.55, 0]} color="#16a34a" />
                <Ico radius={0.15} position={[0.12, 0.66, 0.05]} rotation={[0.4, 0.3, 0]} color="#22c55e" />
                <Ico radius={0.14} position={[-0.1, 0.7, -0.05]} rotation={[0.2, 0.8, 0]} color="#15803d" />
            </>
        )}
    </group>
);

export const FloorLamp: React.FC<{ on?: number }> = ({ on = 0 }) => (
    <group>
        <Cyl args={[0.14, 0.16, 0.03, 20]} position={[0, 0.015, 0]} color={METAL} />
        <Cyl args={[0.018, 0.018, 1.45, 8]} position={[0, 0.75, 0]} color={METAL} />
        <Cyl
            args={[0.13, 0.2, 0.26, 20]}
            position={[0, 1.55, 0]}
            color="#fef3c7"
            emissive="#f59e0b"
            emissiveIntensity={0.05 + on * 2.2}
        />
        {on > 0.01 ? (
            <pointLight position={[0, 1.35, 0]} intensity={on * 3} distance={3.2} decay={1.4} color="#f59e0b" />
        ) : null}
    </group>
);

