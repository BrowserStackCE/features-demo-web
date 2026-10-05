# BrowserStack Config Files

Each file in this folder is a `browserstack.yml` for a specific feature or capability group.
Pass it to the SDK with `--config-file config/<name>.yml`.

| Config file        | Feature                        | Run command                                                                                      |
|--------------------|--------------------------------|--------------------------------------------------------------------------------------------------|
| `default.yml`      | All general tests              | `npx browserstack-node-sdk --config-file config/default.yml jest`                               |
| `apple-pay.yml`    | Apple Pay (real iOS device)    | `npx browserstack-node-sdk --config-file config/apple-pay.yml jest --testPathPattern="tests/apple-pay"` |
| `geolocation.yml`  | GPS + IP Geolocation           | `npx browserstack-node-sdk --config-file config/geolocation.yml jest --testPathPattern="tests/(gps\|ip-geolocation)"` |
| `locale.yml`       | Language & Timezone            | `npx browserstack-node-sdk --config-file config/locale.yml jest --testPathPattern="tests/locale"` |
| `camera-injection.yml` | Camera Injection           | `npm run test:camera` |
| `audio.yml`        | Audio Injection                | `npx browserstack-node-sdk --config-file config/audio.yml jest --testPathPattern="tests/audio"` |
| `network.yml`      | Network Speed Throttling       | `npx browserstack-node-sdk --config-file config/network.yml jest --testPathPattern="tests/network-speed"` |
| `self-healing.yml` | Self-Healing Selectors         | `npx browserstack-node-sdk --config-file config/self-healing.yml jest --testPathPattern="tests/self-healing"` |

## Running all tests with the default config

```bash
cd web-tests
npx browserstack-node-sdk jest --config-file config/default.yml
