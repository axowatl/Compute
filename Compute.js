/**
 * 
 * @param {string} c The 
 * @returns {}
 */
async function CreateShader(c) {
    if (!navigator.gpu) {
        throw Error("WebGPU not supported.");
    }

    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.");
    }

    const shaderModule = device.createShaderModule( { code: c } );
    return shaderModule;
}