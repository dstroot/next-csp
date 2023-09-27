"use client";

import { useEffect } from "react";

export const ClientFunction = ({
  nonce,
  children,
}: {
  nonce: string | null;
  children: React.ReactNode;
}) => {
  console.log("Client: " + nonce);

  useEffect(() => {
    if (nonce) {
      console.log("Client effect: " + nonce);
    }
  }, [nonce]);

  return (
    <>
      <h1>Header</h1>
      {children}
      <h1>Footer</h1>
    </>
  );
};
