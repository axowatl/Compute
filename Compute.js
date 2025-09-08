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
   * @param {Object} [flags={ copy_src: false, copy_dst: false, index: false, indirect: false, map_read: false, map_write: false, query_resolve: false, storage: true, uniform: false, vertex: false }] - Usage flags.
   * @param {boolean} [flags.copy_src=false] - If true, buffer will have COPY_SRC usage.
   * @param {boolean} [flags.copy_dst=false] - If true, buffer will have COPY_DST usage.
   * @param {boolean} [flags.index=false] - If true, buffer will have INDEX usage.
   * @param {boolean} [flags.indirect=false] - If true, buffer will have INDIRECT usage.
   * @param {boolean} [flags.map_read=false] - If true, buffer will have MAP_READ usage.
   * @param {boolean} [flags.map_write=false] - If true, buffer will have MAP_WRITE usage.
   * @param {boolean} [flags.query_resolve=false] - If true, buffer will have QUERY_RESOLVE usage.
   * @param {boolean} [flags.storage=true] - If true, buffer will have STORAGE usage.
   * @param {boolean} [flags.uniform=false] - If true, buffer will have UNIFORM usage.
   * @param {boolean} [flags.vertex=false] - If true, buffer will have VERTEX usage
   */
  constructor(array = null, flags = { copy_src: false, copy_dst: false, index: false, indirect: false, map_read: false, map_write: false, query_resolve: false, storage: true, uniform: false, vertex: false }) {
    // Determine GPUBufferUsage based on flags
    let usage = 0;
    if (flags.copy_src) usage |= GPUBufferUsage.COPY_SRC;
    if (flags.copy_dst) usage |= GPUBufferUsage.COPY_DST;
    if (flags.index) usage |= GPUBufferUsage.INDEX;
    if (flags.indirect) usage |= GPUBufferUsage.INDIRECT;
    if (flags.map_read) usage |= GPUBufferUsage.MAP_READ;
    if (flags.map_write) usage |= GPUBufferUsage.MAP_WRITE;
    if (flags.query_resolve) usage |= GPUBufferUsage.QUERY_RESOLVE;
    if (flags.storage) usage |= GPUBufferUsage.STORAGE;
    if (flags.uniform) usage |= GPUBufferUsage.UNIFORM;
    if (flags.vertex) usage |= GPUBufferUsage.VERTEX;

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

  /**
   * 
   * @param {number} binding - the binding to the shader
   * @param {number} type - 0 for readOnlyStorage, 1 for storage, 2 for uniform
   */
  setBindings(b, t) {
    let _t;
    switch (t) {
      case 0:
        _t = "read-only-storage";
        break;
      case 1:
        _t = "storage";
        break;
      case 2:
        _t = "uniform";
        break;
      default:
        console.error("Did not provide a correct type value");
    }

    this.entry = {
      binding: b,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: _t }
    }
  }
}
