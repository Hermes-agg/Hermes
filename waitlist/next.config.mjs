/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "www.jito.network", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "kamino.com", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "docs.marinade.finance", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "solend.fi", port: "", pathname: "/**", search: "" },
      { protocol: "https", hostname: "jup.ag", port: "", pathname: "/**", search: "" },
    ],
  },
}

export default nextConfig
