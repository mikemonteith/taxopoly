import type { Config } from "@react-router/dev/config";

export default {
  // This app is intended to be very cheap to host,
  // so no backend server - all rendered at build time.
  ssr: false,
  prerender: true,
} satisfies Config;
