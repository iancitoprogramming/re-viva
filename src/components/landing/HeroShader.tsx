'use client'

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export default function HeroShader() {
  return (
    <ShaderGradientCanvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      pixelDensity={1}
      fov={45}
      pointerEvents="none"
      lazyLoad
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uSpeed={0.08}
        uStrength={2.2}
        uDensity={1.3}
        uFrequency={5.5}
        uAmplitude={0}
        color1="#0F2A1F"
        color2="#2E5E4E"
        color3="#C9A96E"
        lightType="3d"
        brightness={1.1}
        envPreset="city"
        reflection={0.15}
        cAzimuthAngle={180}
        cPolarAngle={80}
        cDistance={3.6}
        cameraZoom={9.4}
        positionX={0}
        positionY={0.4}
        positionZ={0}
        rotationX={0}
        rotationY={10}
        rotationZ={50}
        wireframe={false}
      />
    </ShaderGradientCanvas>
  )
}
