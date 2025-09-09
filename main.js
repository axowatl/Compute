// main.js

async function initWebGPU() {
    // 1. Get WebGPU adapter and device
    if (!navigator.gpu) {
        throw new Error("WebGPU is not supported in this browser.");
    }
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error("No WebGPU adapter found.");
    }
    const device = await adapter.requestDevice();

    // 2. Configure the canvas
    const canvas = document.getElementById("webgpu-canvas");
    const context = canvas.getContext("webgpu");
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device,
        format: presentationFormat,
        alphaMode: 'opaque',
    });

    // 3. Define the square's geometry (as two triangles)
    const vertices = new Float32Array([
        // Position X, Position Y
        -0.5,  0.5, // Top-left (Vertex 0)
         0.5,  0.5, // Top-right (Vertex 1)
         0.5, -0.5, // Bottom-right (Vertex 2)
        -0.5, -0.5, // Bottom-left (Vertex 3)
    ]);
    const indices = new Uint16Array([
        0, 1, 2, // First triangle
        0, 2, 3, // Second triangle
    ]);

    // 4. Create GPU buffers for vertices and indices
    const vertexBuffer = device.createBuffer({
        label: "Square Vertices",
        size: vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(vertexBuffer, 0, vertices);

    const indexBuffer = device.createBuffer({
        label: "Square Indices",
        size: indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(indexBuffer, 0, indices);

    // 5. Create the shader module (WGSL code)
    const shaderModule = device.createShaderModule({
        label: "Square Shaders",
        code: `
            @vertex
            fn vs_main(@location(0) pos: vec2<f32>) -> @builtin(position) vec4<f32> {
                return vec4<f32>(pos, 0.0, 1.0);
            }

            @fragment
            fn fs_main() -> @location(0) vec4<f32> {
                // Return a solid red color (r=1.0, g=0.0, b=0.0, a=1.0)
                return vec4<f32>(1.0, 0.0, 0.0, 1.0);
            }
        `,
    });

    // 6. Create the render pipeline
    const renderPipeline = device.createRenderPipeline({
        label: "Square Render Pipeline",
        layout: 'auto',
        vertex: {
            module: shaderModule,
            entryPoint: "vs_main",
            buffers: [{
                arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT, // 8 bytes per vertex (2 floats)
                attributes: [{
                    shaderLocation: 0,
                    offset: 0,
                    format: "float32x2",
                }],
            }],
        },
        fragment: {
            module: shaderModule,
            entryPoint: "fs_main",
            targets: [{
                format: presentationFormat,
            }],
        },
        primitive: {
            topology: "triangle-list",
        },
    });

    // 7. Define the render loop
    const render = () => {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPassDescriptor = {
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // Clear background to black
                loadOp: 'clear',
                storeOp: 'store',
            }],
        };

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
        passEncoder.setPipeline(renderPipeline);
        passEncoder.setVertexBuffer(0, vertexBuffer);
        passEncoder.setIndexBuffer(indexBuffer, "uint16");
        passEncoder.drawIndexed(indices.length);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(render);
    };

    render();
}

// Run the main function
initWebGPU().catch(console.error);

// Handle window resizing
window.addEventListener("resize", () => {
    const canvas = document.getElementById("webgpu-canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
});
window.dispatchEvent(new Event("resize"));


/*
import { ComputeShader, ComputeBuffer } from "./Compute.js";

const wgsl = `
@group(0) @binding(0) var<storage, read> input: array<f32>;
@group(0) @binding(1) var<storage, read_write> result: f32;

@compute @workgroup_size(1)
fn sum() {
    var sum_value: f32 = 0.0;
    for (var i: u32 = 0u; i < arrayLength(&input); i = i + 1u) {
        sum_value = sum_value + input[i];
    }
    result = sum_value;
}
`

const cShader = new ComputeShader(wgsl);

const inputBuffer = new ComputeBuffer(new Float32Array([1, 2, 3, 4, 5]), { storage: true, copy_dst: true });

const resultBuffer = new ComputeBuffer(null, { storage: true, copy_src: true });

const stagingBuffer = new ComputeBuffer(null, { map_read: true, copy_dst: true });

inputBuffer.setBindings(0, 0);
resultBuffer.setBindings(1, 1);

const results = await cShader.Dispatch("sum", [inputBuffer, resultBuffer], resultBuffer, stagingBuffer);

console.log( results ) // 15
*/