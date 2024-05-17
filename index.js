console.clear();

const HTTP = require("http");
const EXPRESS = require("express");
const CORS = require("cors");
const DOTENV = require("dotenv");
const FS = require("fs");
const PATH = require("path");
const SOCKETIO = require("socket.io");

DOTENV.config();

const expressApp = EXPRESS();

const httpServer = HTTP.createServer(expressApp);

const socketioServer = SOCKETIO(httpServer, {
  cors: {
    origin: "*",
  },
});

const Context = function () {
  this.getHttpServer = () => httpServer;
  this.getExpressApp = () => expressApp;
  this.getSocketioServer = () => socketioServer;
  // this.getWebsocketServer=()=>websocketServer;
};

const context = new Context();

expressApp.use(CORS());

//to prepare $
const $RootPath = `/$`;

const $_indexFolder = function (relativePathTo$Root) {
  const children = FS.readdirSync(
    PATH.join(__dirname, $RootPath, relativePathTo$Root)
  );
  for (const child of children) {
    const childRelativePathTo$Root = PATH.join(relativePathTo$Root, child);
    const stat = FS.statSync(
      PATH.join(__dirname, $RootPath, childRelativePathTo$Root)
    );
    if (stat.isDirectory()) {
      $_indexFolder(childRelativePathTo$Root);
    }
    if (stat.isFile()) {
      const obj = require(`./${PATH.join(
        $RootPath,
        childRelativePathTo$Root
      )}`);

      if (typeof obj.$ != "function") {
        console.log(
          new Error(
            `missing $ function => (context,expressApp,socketioServer) in ${$RootPath}${childRelativePathTo$Root}`
          )
        );
        continue;
      }

      obj.$(context, expressApp, socketioServer);
    }
  }
};

$_indexFolder(`/`);

//to log all 404 requests
expressApp.use((requestObj, responder, next) => {
  responder.status(404).send();

  console.log(
    "\x1b[31m%s\x1b[34m%s\x1b[0m",
    `\n>>>>>>> 404 `,
    `${requestObj.method}---${requestObj.originalUrl}`,
    "\n",
    new Error().stack.split("\n")[1]
  );
});

httpServer.listen(process.env.PORT || 80, () => {
  console.log(`APP-LISTENING:${httpServer.address().port}`);
});
