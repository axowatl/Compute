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

const inputBuffer = new ComputeBuffer(new Float32Array([1, 2, 3, 4, 5]), { storage: true, copy_dst: true });

const resultBuffer = new ComputeBuffer(null, { storage: true, copy_src: true });

const stagingBuffer = new ComputeBuffer(null, { map_read: true, copy_dst: true });

inputBuffer.setBindings(0, 0);
resultBuffer.setBindings(1, 1);

const results = await cShader.Dispatch("sum", [inputBuffer, resultBuffer], resultBuffer, stagingBuffer);

console.log( results[0] ) // 15