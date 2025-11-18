# RSSchool NodeJS websocket task template
> Static http server and base task packages.
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage

### HTTP Server (Client UI)
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

### WebSocket Server
The WebSocket server is located in the `src/ws_server` directory and must be started separately.

**Development**

```bash
cd src/ws_server
npm run dev
```

* WebSocket server runs on port 3000 (by default) with nodemon (auto-restart on file changes)

**Production**

```bash
cd src/ws_server
npm run start
```

* Builds TypeScript and starts the WebSocket server on port 3000 (by default)

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | HTTP server @ `http://localhost:8181` with nodemon
`npm run start` | HTTP server @ `http://localhost:8181` without nodemon
`cd src/ws_server && npm run dev` | WebSocket server @ port 3000 with nodemon
`cd src/ws_server && npm run start` | Build and run WebSocket server @ port 3000

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.
