import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained .next/standalone build (only the
  // files actually needed at runtime, with a tiny production server) —
  // makes the Docker image far smaller and the container faster to start.
  output: "standalone",
};

export default nextConfig;
