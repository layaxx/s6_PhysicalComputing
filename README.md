# Project Repository for my term paper in SME-PHY-B: Physical Computing

## Requirements

### Physical Components

### Software

- Node.js, preferably current LTS (16.17.0)
  - yarn for dependency management
  - dependencies as documented in `sourcecode/laptop/package.json`
- AVR-GCC

## Workflow

- Connect Arduino
- TODO: replace ports as necessary, default is `/dev/ttyUSB`
- run `make program` from `sourcecode/arduino`
- run `yarn` from `sourcecode/laptop` [only necessary once/after changing dependencies]
- run `yarn start` from `sourcecode/laptop`
  - alternatively, you can run components individually:
    - `yarn proxy` for proxying Serial to WebSocket
    - `yarn dev` for web server with hot-reload
    - `yarn benchmark` for running benchmarks with arduino
    - `yarn test` for running tests
