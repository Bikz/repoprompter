"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  sayHello: () => {
    console.log("Hello from preload!");
  }
});
