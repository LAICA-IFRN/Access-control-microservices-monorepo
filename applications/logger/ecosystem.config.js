module.exports = {
  apps: [
    {
      name: "logger",
      namespace: "application",
      version: "1.0.0",
      script: "./dist/index.js",
      instances: 1,
      max_memory_restart: "300M",
      out_file: "./out.log",
      error_file: "./error.log",
      merge_logs: true,
      log_date_format: "DD-MM-YY HH:mm:ss",
      log_type: "raw",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        exec_mode: "cluster_mode",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        watch: true,
        watch_delay: 3000,
        ignore_watch: [
          "./node_modules",
          "./package.json",
          "./src"
        ],
      },
    },
  ],
};
