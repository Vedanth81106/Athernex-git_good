"use client";
import React from 'react'
import PixelBlast from '@/components/PixelBlast.jsx'
import Shuffle from '@/components/Shuffle';
import EncryptButton from '@/components/Button.jsx'
import Link from 'next/link';
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
        {/* CTA Section: Button remains interactive */}
        <div className="flex flex-col items-center gap-4 pointer-events-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            Click Here to Start
          </p>
          <Link href="/dashboard">
            <EncryptButton />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home