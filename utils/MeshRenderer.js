/*
Goal is to make it so you can render 3d meshes using WebGPU
 */

import { device, gpu } from "./constants";

const cubeVertices = new Float32Array([
    // X,    Y,    Z
    -1, -1, -1,  1, -1, -1,  1,  1, -1,  -1, 1, -1,  // back
    -1, -1,  1,  1, -1,  1,  1,  1,  1,  -1, 1,  1,  // front
]);

const cubeIndices = new Uint16Array([
    0,1,2,  2,3,0, // back
    4,5,6,  6,7,4, // front
    0,4,7,  7,3,0, // left
    1,5,6,  6,2,1, // right
    3,2,6,  6,7,3, // top
    0,1,5,  5,4,0  // bottom
]);

const vertexBuffer = device.createBuffer({
    size: cubeVertices.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
});
device.queue.writeBuffer(vertexBuffer, 0, cubeVertices);

const indexBuffer = device.createBuffer({
    size: cubeIndices.byteLength, usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
});
device.queue.writeBuffer(indexBuffer, 0, cubeIndices);

const vscode = `
[[stage(vertex)]]
fn main([[location(0)]] pos: vec3<f32>) -> [[builtin(position)]] vec4<f32> {
  // Apply transformation matrices (add those as uniforms in real use)
  return vec4<f32>(pos, 1.0);
}
`;

const fscode = `
[[stage(fragment)]]
fn main() -> [[location(0)]] vec4<f32> {
  return vec4<f32>(0.3, 0.7, 1.0, 1.0); // Cube color
}
`;

const commandEncoder = device.createCommandEncoder();
const renderPass = commandEncoder.beginRenderPass(/* ... */);
renderPass.setPipeline(pipeline);
renderPass.setVertexBuffer(0, vertexBuffer);
renderPass.setIndexBuffer(indexBuffer, 'uint16');
renderPass.drawIndexed(cubeIndices.length, 1, 0, 0, 0);
renderPass.endPass();
device.queue.submit([commandEncoder.finish()]);
