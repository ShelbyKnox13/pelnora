module.exports = {
  webpack: (config, { isServer }) => {
    // Fix for cloudflare:sockets scheme error
    config.resolve.alias = {
      ...config.resolve.alias,
      'cloudflare:sockets': false,
    };

    // Add support for path aliases
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      __dirname,
    ];

    return config;
  },
  experimental: {
    esmExternals: false,
  },
};
