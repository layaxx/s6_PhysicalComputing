# Project Repository for my term paper in SME-PHY-B: Physical Computing

## Requirements

### Physical Components

Arduino Nano with MPU6050 and HC-SR04, schematic is provided in `paper`

### Software

- Node.js, preferably current LTS (16.17.0), but 14.x should work as well
  - yarn for dependency management
  - dependencies as documented in `sourcecode/laptop/package.json`
- AVR-GCC

## Workflow

- Connect Arduino
- If your Arduino can not be reached at `/dev/ttyUSB0` you will have to update your path at two places:
  - `sourcecode/arduino/Makefile`
  - `sourcecode/laptop/config.json`
- run `make program` from `sourcecode/arduino`
- run `yarn` from `sourcecode/laptop` [only necessary once/after changing dependencies]
- run `yarn start` from `sourcecode/laptop`
  - alternatively, you can run components individually:
    - `yarn proxy` for proxying Serial to WebSocket
    - `yarn dev` for web server with hot-reload
    - `yarn benchmark` for running benchmarks with arduino
    - `yarn test` for running tests
