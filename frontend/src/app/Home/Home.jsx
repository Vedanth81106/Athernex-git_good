"use client";
import React from 'react'
import PixelBlast from '@/components/PixelBlast.jsx'


const Home = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      
      {/* BACKGROUND LAYER: Animated Pixel Effects */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#B497CF"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples={true}
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid={false}
          speed={0.5}
          edgeFade={0.25}
          transparent={true}
        />
      </div>
    </div>
  )
}

export default Home