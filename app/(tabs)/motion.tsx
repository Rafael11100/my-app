import React from 'react';
import SensorScreen from '@/components/schoolsafe/sensor-screen';
export default function MotionScreen() {
  return (
    <SensorScreen
      kind="motion"
      title="Sensores de Movimento"
      subtitle="5 sensores"
      cardTitle="Detector de Presença"
      route="/motion"
      accent="#3B82F6"
      blinkFrom="rgba(59,130,246,0)"
      blinkTo="rgba(59,130,246,0.12)"
      duration={2000}
    />
  );
}
