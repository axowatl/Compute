//#region Top
// Ensure this is inside an async function or top-level await
if (!navigator.gpu) {
  throw Error("WebGPU not supported.");
}

/** @type {GPUAdapter} */
const adapter = await navigator.gpu.requestAdapter();
if (!adapter) {
  throw Error("Couldn't request WebGPU adapter.");
}

/** @type {GPUDevice} */
const device = await adapter.requestDevice();
//#endregion Top

/**
 * Represents a compute shader module.
 */
export class ComputeShader {
  /**
   * Creates a new ComputeShader instance.
   * @param {string} c - The shader code (WGSL or other supported language).
   */
  constructor(c) {
    /**
     * The GPUShaderModule created from the shader code.
     * @type {GPUShaderModule}
     */
    this.shaderModule = device.createShaderModule({ code: c });
  }
}

/**
 * Represents a GPU buffer for compute operations.
 */
export class ComputeBuffer {
  /**
   * Creates a new ComputeBuffer.
   * @param {ArrayBuffer | null} [array=null] - Optional initial data for the buffer.
   * @param {Object} [flags={ storage: true, uniform: false, copy_dst: false, copy_src: false }] - Usage flags.
   * @param {boolean} [flags.storage=true] - If true, buffer will have STORAGE usage.
   * @param {boolean} [flags.uniform=false] - If true, buffer will have UNIFORM usage.
   * @param {boolean} [flags.copy_dst=false] - If true, buffer will have COPY_DST usage.
   * @param {boolean} [flags.copy_src=false] - If true, buffer will have COPY_SRC usage.
   */
  constructor(array = null, flags = { storage: true, uniform: false, copy_dst: false, copy_src: false }) {
    // Determine GPUBufferUsage based on flags
    let usage = 0;
    if (flags.storage) usage |= GPUBufferUsage.STORAGE;
    if (flags.uniform) usage |= GPUBufferUsage.UNIFORM;
    if (flags.copy_dst) usage |= GPUBufferUsage.COPY_DST;
    if (flags.copy_src) usage |= GPUBufferUsage.COPY_SRC;

    // Create buffer with or without initial data
    this.buffer = device.createBuffer({
      size: array ? array.byteLength : 4, // default size if no data
      usage,
      mappedAtCreation: !!array,
    });

    // If initial data is provided, write it into the buffer
    if (array) {
      const writeArray = new Uint8Array(this.buffer.getMappedRange());
      writeArray.set(new Uint8Array(array.buffer));
      this.buffer.unmap();
    }
  }
}

const cBuffer = new ComputeBuffer()
