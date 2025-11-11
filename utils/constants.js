if (!navigator.gpu) {
	throw Error("WebGPU not supported.");
}

/** @type {GPUAdapter} */
export const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
	throw Error("Couldn't request WebGPU adapter.");
}

/** @type {GPUDevice} */
export const device = await adapter.requestDevice();

/** @type {GPUCanvasContext} */
export const gpu = canvas.getContext('webgpu');

export const devicePixelRatio = window.devicePixelRatio;

canvas.width = canvas.clientWidth * devicePixelRatio;
canvas.height = canvas.clientHeight * devicePixelRatio;

export const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

gpu.configure({
  device,
  format: presentationFormat,
});
