async function initWebGPU() {
  if (!navigator.gpu) {
    document.getElementById('output').innerText = 'WebGPU not supported!';
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();

  // Data: two arrays to add
  const size = 16;
  const arrayA = new Float32Array(size).fill(1);
  const arrayB = new Float32Array(size).fill(2);
  const resultBufferSize = size * Float32Array.BYTES_PER_ELEMENT;

  // Create GPU buffers
  const gpuBufferA = device.createBuffer({
    size: arrayA.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const gpuBufferB = device.createBuffer({
    size: arrayB.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const gpuResultBuffer = device.createBuffer({
    size: resultBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });
  const readBuffer = device.createBuffer({
    size: resultBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });

  // Write data to GPU buffers
  device.queue.writeBuffer(gpuBufferA, 0, arrayA.buffer, arrayA.byteOffset, arrayA.byteLength);
  device.queue.writeBuffer(gpuBufferB, 0, arrayB.buffer, arrayB.byteOffset, arrayB.byteLength);

  // Compute shader code (WGSL)
  const shaderCode = `
    @group(0) @binding(0) var<storage, read> a : array<f32>;
    @group(0) @binding(1) var<storage, read> b : array<f32>;
    @group(0) @binding(2) var<storage, write> result : array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
      let index = global_id.x;
      if (index < arrayLength(&a)) {
        result[index] = a[index] + b[index];
      }
    }
  `;

  // Create shader module
  const shaderModule = device.createShaderModule({ code: shaderCode });

  // Create pipeline
  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: shaderModule,
      entryPoint: 'main'
    }
  });

  // Bind group
  const bindGroup = device.createBindGroup({
    layout: computePipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: gpuBufferA } },
      { binding: 1, resource: { buffer: gpuBufferB } },
      { binding: 2, resource: { buffer: gpuResultBuffer } },
    ],
  });

  // Encode commands
  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  const workgroupCount = Math.ceil(size / 64);
  passEncoder.dispatchWorkgroups(workgroupCount);
  passEncoder.end();

  // Copy result to read buffer
  commandEncoder.copyBufferToBuffer(gpuResultBuffer, 0, readBuffer, 0, resultBufferSize);

  // Submit commands
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  // Read buffer
  await readBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = readBuffer.getMappedRange();
  const resultArray = new Float32Array(arrayBuffer.slice(0));
  readBuffer.unmap();

  // Display result
  document.getElementById('output').innerText = 'Result: ' + resultArray.join(', ');
}

initWebGPU();