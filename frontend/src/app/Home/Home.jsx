"use client";
import React from 'react'
import PixelBlast from '@/components/PixelBlast.jsx'
import Shuffle from '@/components/Shuffle';

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
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-12 pointer-events-none">

        {/* Shuffle Text: Hover effect enabled via 'pointer-events-auto' */}
        <div className="text-5xl font-black tracking-tighter text-white md:text-7xl pointer-events-auto cursor-default">
          <Shuffle
            text=" Kintsugi "
            triggerOnHover={true}
          />
        </div>
      </div>
    </div>
  )
}

export default Home