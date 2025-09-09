import { MeshRenderer } from "./Render";
import { Material } from "./Material";

async function main() {
    // Check for WebGPU support
    if (!navigator.gpu) {
        alert("WebGPU not supported in this browser.");
        return;
    }

    // Request adapter and device
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();

    // Set up canvas
    const canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const context = canvas.getContext("webgpu");
    const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

    context.configure({
        device,
        format: presentationFormat,
        alphaMode: 'opaque',
    });

    // Define simple triangle vertices (positions)
    const vertices = new Float32Array([
        // x, y, z
        0.0,  0.5, 0.0,
       -0.5, -0.5, 0.0,
        0.5, -0.5, 0.0,
    ]);

    // Indices for the triangle
    const indices = new Uint16Array([0, 1, 2]);

    // Create material with basic shaders
    const vertexShaderCode = `
        @vertex
        fn vs_main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32> {
            return vec4<f32>(pos, 1.0);
        }
    `;

    const fragmentShaderCode = `
        @fragment
        fn fs_main() -> @location(0) vec4<f32> {
            return vec4<f32>(0.0, 0.5, 1.0, 1.0); // blue color
        }
    `;

    const material = new Material(vertexShaderCode, fragmentShaderCode);
    await material.createShaderModules(device);

    // Create MeshRenderer instance
    const mesh = new MeshRenderer(vertices, indices, material, device, context, presentationFormat);

    // Render loop
    function frame() {
        mesh.render();
        requestAnimationFrame(frame);
    }
    frame();
}

// Run main
main();


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
