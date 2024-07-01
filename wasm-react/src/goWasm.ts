export const loadWasm = async () => {
  const go = new Go();
  const wasm = await WebAssembly.instantiateStreaming(fetch("main.wasm"), go.importObject);
  go.run(wasm.instance);
};

