import { ComputeShader, ComputeBuffer } from "./Compute.js";

const wgsl = `
@group( 0 ) @binding( 0 ) var<storage, read> input: array<f32>;
@group( 0 ) @binding( 1 ) var<storage, read_write> result: f32;

@compute @workgroup_size(1)
fn sum() {

    for ( var i = 0u; i < arrayLength( &input ); i++ ) {

        result += input[ i ];
    }
}
`

const cShader = new ComputeShader(wgsl);

/*
const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()
const shaderModule = device.createShaderModule( { code: wgsl } )
console.log(shaderModule)
*/

const inputBuffer = new ComputeBuffer(new Float32Array([1, 2, 3, 4, 5]), { storage: true, copy_dst: true });

/*
const inputData = new Float32Array( [ 1, 2, 3, 4, 5 ] )

const inputBuffer = device.createBuffer( {
    size: inputData.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
} )

const arrayBuffer = inputBuffer.getMappedRange()
new Float32Array( arrayBuffer ).set( inputData )
inputBuffer.unmap()
*/

const resultBuffer = new ComputeBuffer(null, { storage: true, copy_src: true });

/*
const resultBuffer = device.createBuffer( {
    size: 4,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
} )
*/

const stagingBuffer = new ComputeBuffer(null, { map_read: true, copy_dst: true });

/*
const stagingBuffer = device.createBuffer( {
    size: 4,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
} )
*/

inputBuffer.setBindings(0, 0);
resultBuffer.setBindings(1, 1);

const results = cShader.Dispatch("sum", [inputBuffer, resultBuffer], resultBuffer, stagingBuffer);

/*
const bindGroupLayout = device.createBindGroupLayout( {
    entries: [
        {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "read-only-storage" }
        },
        {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: "storage" }
        },
    ],
} )
*/

/*
const bindGroup = device.createBindGroup( {
    layout: bindGroupLayout,
    entries: [
        {
            binding: 0,
            resource: { buffer: inputBuffer }
        },
        {
            binding: 1,
            resource: { buffer: resultBuffer }
        },
    ],
} )

const computePipeline = device.createComputePipeline( {
    layout: device.createPipelineLayout( {
        bindGroupLayouts: [ bindGroupLayout, ]
    } ),
    compute: {
        module: shaderModule,
    },
} )

const commandEncoder = device.createCommandEncoder()

const passEncoder = commandEncoder.beginComputePass()
passEncoder.setPipeline( computePipeline )
passEncoder.setBindGroup( 0, bindGroup )
passEncoder.dispatchWorkgroups( 1 )
passEncoder.end()

commandEncoder.copyBufferToBuffer( resultBuffer, 0, stagingBuffer, 0, 4 )

device.queue.submit( [ commandEncoder.finish() ] )

await stagingBuffer.mapAsync( GPUMapMode.READ )
const resultArrayBuffer = stagingBuffer.getMappedRange()
const result = new Float32Array( resultArrayBuffer )[ 0 ]
stagingBuffer.unmap()
*/

console.log( results ) // 15