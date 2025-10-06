"use client";

import AbsoDataComponent from "./absodata/absodata";

interface DataProps {
  controllerId: string;
}

const Data = ({ controllerId }: DataProps) => {
  return <AbsoDataComponent controllerId={controllerId} />;
};

export default Data;
