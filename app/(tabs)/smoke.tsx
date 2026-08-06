import React from 'react';

import SensorScreen from '@/components/schoolsafe/sensor-screen';

export default function SmokeScreen() {
  return (
    <SensorScreen
      kind="smoke"
      title="Monitoramento de Fumaça"
      subtitle="Banheiro"
      cardTitle="🔥 Detector de Fumaça"
      route="/smoke"
accent="#DC2626"
      blinkFrom="rgba(220,38,38,0)"
      blinkTo="rgba(220,38,38,0.55)"
      duration={10000}
    />
  );
}
