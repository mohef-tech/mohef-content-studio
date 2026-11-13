import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig } from 'remotion';
import { CAMERA_POSITION, CAMERA_ZOOM } from '../lib/constants';

/** ThreeCanvas isometrik standar dengan bayangan lembut aktif. */
export const IsoStage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { width, height } = useVideoConfig();
    return (
        <ThreeCanvas
            width={width}
            height={height}
            orthographic
            shadows
            camera={{ position: CAMERA_POSITION, zoom: CAMERA_ZOOM, near: 0.1, far: 100 }}
        >
            {children}
        </ThreeCanvas>
    );
};

interface LightsProps {
    ambient?: number;
    hemi?: number;
    keyIntensity?: number;
    keyColor?: string;
    keyPosition?: [number, number, number];
}

/** Lampu studio: ambient + hemisphere + key light pembentuk bayangan. */
export const StudioLights: React.FC<LightsProps> = ({
    ambient = 0.45,
    hemi = 0.55,
    keyIntensity = 1.6,
    keyColor = '#fff7ed',
    keyPosition = [6, 12, 8],
}) => (
    <>
        <ambientLight intensity={ambient} />
        <hemisphereLight args={['#dbeafe', '#1e293b', hemi]} />
        <directionalLight
            position={keyPosition}
            intensity={keyIntensity}
            color={keyColor}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-bias={-0.0004}
            shadow-normalBias={0.02}
        />
    </>
);
