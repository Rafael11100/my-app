import React from 'react';
import SensorScreen from '@/components/schoolsafe/sensor-screen';
export default function SmokeScreen() {
  return (
    <SensorScreen
      kind="smoke"
      title="Sensores de Fumaça"
      subtitle="5 sensores"
      cardTitle="Detector de Fumaça"
      route="/smoke"
      accent="#EF4444"
      blinkFrom="rgba(239,68,68,0)"
      blinkTo="rgba(239,68,68,0.12)"
      duration={10000}
    />
  );
}
