declare var HTTP_BASE_URL: string; // base url of collab server http api, defined by build tool(webpack)
// declare var WS_BASE_URL: string; // base url of collab server websocket api, defined by build tool(webpack)
declare var APP: string;
declare var VERSION: string;
// declare var __webpack_public_path__: string;

console.table({
  'collaboration demo': {
    version: VERSION || 'public',
  },
});

function getConfig() {
  if (APP === 'dev') {
    return {
      serverUrl: HTTP_BASE_URL || `http://${window.location.hostname}:8080`,
    };
  } else {
    // 部署到 azk8s 环境
    return {
      serverUrl: `https://${window.location.host}/collab-server`,
    };
  }
}

const config = getConfig();
export const serverUrl = config.serverUrl;

// export const PUBLIC_PATH = __webpack_public_path__;
export const PUBLIC_PATH = '/';

//@ts-ignore
export const licenseSN = window.licenseSN;
//@ts-ignore
export const licenseKey = window.licenseKey;
