import React from 'react';

import SensorScreen from '@/components/schoolsafe/sensor-screen';

export default function MotionScreen() {
  return (
    <SensorScreen
      kind="motion"
      title="Monitoramento de Presença"
      subtitle="Corredor Principal"
      cardTitle="🚶 Detector de Presença"
      route="/motion"
      accent="#2563EB"
      blinkFrom="rgba(37,99,235,0)"
      blinkTo="rgba(37,99,235,0.55)"
      duration={2000}
    />
  );
}
