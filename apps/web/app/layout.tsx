import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flow Factory",
  description: "Local-first software factory",
};

export default ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: 0,
        background: "#f7f7f2",
        color: "#202522",
      }}
    >
      {children}
    </body>
  </html>
);
