# BrowserStack Config Files

Each file in this folder is a `browserstack.yml` for a specific feature or capability group.
Pass it to the SDK with `--config-file config/<name>.yml`.

| Config file        | Feature                        | Run command                                                                                      |
|--------------------|--------------------------------|--------------------------------------------------------------------------------------------------|
| `default.yml`      | All general tests              | `npx browserstack-node-sdk --config-file config/default.yml jest`                               |
| `apple-pay.yml`    | Apple Pay (real iOS device)    | `npx browserstack-node-sdk --config-file config/apple-pay.yml jest --testPathPattern="tests/apple-pay"` |
| `geolocation.yml`  | GPS + IP Geolocation           | `npx browserstack-node-sdk --config-file config/geolocation.yml jest --testPathPattern="tests/(gps\|ip-geolocation)"` |
| `locale.yml`       | Language & Timezone            | `npx browserstack-node-sdk --config-file config/locale.yml jest --testPathPattern="tests/locale"` |
| `camera.yml`       | Camera Injection               | `npx browserstack-node-sdk --config-file config/camera.yml jest --testPathPattern="tests/camera"` |
| `network.yml`      | Network Speed Throttling       | `npx browserstack-node-sdk --config-file config/network.yml jest --testPathPattern="tests/network-speed"` |

## Running all tests with the default config

```bash
cd web-tests
npx browserstack-node-sdk jest --config-file config/default.yml
