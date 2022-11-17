export type LuaWorkerEvent = {
  type: 'output' | 'success' | 'error';
  outputBuf: string;
};
