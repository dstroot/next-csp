"use client";

export const ClientFunction = ({
  nonce,
  children,
}: {
  nonce: string | null;
  children: React.ReactNode;
}) => {
  console.log(nonce);

  return (
    <>
      <h1>Header</h1>
      {children}
      <h1>Footer</h1>
    </>
  );
};
