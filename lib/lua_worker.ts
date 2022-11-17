import { LuaWorkerEvent } from './event';

// @ts-ignore
importScripts('/gopher-lua-playground/wasm_exec.js');
// @ts-ignore
const go = new Go();

// In order to output the buffer to the browser, update `writeSync`.
const decoder = new TextDecoder('utf-8');
// @ts-ignore
globalThis.fs.writeSync = (fd, buf) => {
  const event: LuaWorkerEvent = {
    type: 'output',
    outputBuf: decoder.decode(buf),
  };
  postMessage(event);
  return buf.length;
};
WebAssembly.instantiateStreaming(fetch('/gopher-lua-playground/gopher-lua-playground.wasm'), go.importObject).then((result) => {
  go.run(result.instance);
});

onmessage = (e: MessageEvent<string>) => {
  GopherLuaPlayground.run(e.data)
    .then(() => {
      const event: LuaWorkerEvent = {
        type: 'success',
        outputBuf: '',
      };
      postMessage(event);
    })
    .catch((e) => {
      const event: LuaWorkerEvent = {
        type: 'output',
        outputBuf: e,
      };
      postMessage(event);
      const event2: LuaWorkerEvent = {
        type: 'error',
        outputBuf: '',
      };
      postMessage(event2);
    });
};
