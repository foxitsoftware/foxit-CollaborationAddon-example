import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { createHtmlPlugin } from "vite-plugin-html";

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false,
        }),
      ],
    }),
    createHtmlPlugin({
      minify: !isDev, 
      pages: [
        {
          filename: "index.html",
          template: "index.html",
          injectOptions: {
            data: {
              publicPath: isDev ? "/" : "/demo/",
              licensePath:
                "https://cdn-sdk.foxitsoftware.com/pdf-sdk/download/foxit-pdf-sdk-for-web/pcmobile/license-key.js",
              UIExtensionLib: isDev
                ? "/foxitwebsdk/lib/UIExtension.full.js"
                : "/demo/foxitwebsdk/lib/UIExtension.full.js",
              PDFViewCtrlLib: isDev
                ? "/foxitwebsdk/lib/PDFViewCtrl.full.js"
                : "/demo/foxitwebsdk/lib/PDFViewCtrl.full.js",
            },
          },
        },
      ],
    }),
  ],
  optimizeDeps: {
    include: ["@foxitsoftware/web-collab-client"],
  },
  build: {
    commonjsOptions: {
      include: [/collab-client/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      assets: fileURLToPath(new URL("./src/assets", import.meta.url)),
    },
  },
  server: {
    host:'0.0.0.0',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE,FETCH",
      "Access-Control-Allow-Headers":
        "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,token,source",
      "Access-Control-Expose-Headers":
        "content-range, content-type, accept-ranges",
      "Service-Worker-Allowed": "/",
    },
    strictPort: true,
    open: true,
    allowedHosts: true,
    proxy: {
      "/collab-server": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/collab-server/, ""),
      },
    },
  },
  define: {
    APP: JSON.stringify(process.env["APP"] || "dev"), 
    VERSION: JSON.stringify(process.env["DEMO_VERSION"] || ""), 
    __COLLAB_CLIENT_VERSION__: JSON.stringify("src"), 
    HTTP_BASE_URL: JSON.stringify(process.env["HTTP_BASE_URL"] || ""), 
    WS_BASE_URL: JSON.stringify(process.env["WS_BASE_URL"] || ""), 
  },
});
