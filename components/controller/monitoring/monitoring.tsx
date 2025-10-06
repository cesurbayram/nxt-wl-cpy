"use client";

import Tork from "./tork/tork";

interface MonitoringProps {
  controllerId: string;
}

const Monitoring = ({ controllerId }: MonitoringProps) => {
  return <Tork controllerId={controllerId} />;
};

export default Monitoring;
