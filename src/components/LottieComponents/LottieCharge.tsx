'use client'

import React from 'react';
import Lottie from 'lottie-react';

interface LottieChargeProps {
  animationData: object
}

export const LottieCharge = ({animationData} : LottieChargeProps) => {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: '280px', height: '280px' }}
    />
  );
};
