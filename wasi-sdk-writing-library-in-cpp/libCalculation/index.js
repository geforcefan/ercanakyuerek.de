const libCalculation = async (wasmFileResponsePromise) => {
    const memory = new WebAssembly.Memory({
        initial: 10000,
        maximum: 10000,
    });

    const module = await WebAssembly.compileStreaming(wasmFileResponsePromise);
    const instance = await WebAssembly.instantiate(module, {
        wasi_snapshot_preview1: {
            environ_get: () => {},
            environ_sizes_get: () => {},
            fd_close: () => {},
            fd_fdstat_get: () => {},
            fd_read: () => {},
            fd_write: () => {},
            proc_exit: () => {},
            fd_seek: () => {},
            fd_fdstat_set_flags: () => {},
            fd_prestat_get: () => {},
            fd_prestat_dir_name: () => {},
            path_open: () => {},
        },
        memory,
    });

    const getSplineLength = (splinePointer) => {
        const { getSplineLength : func } = instance.exports;
        return func(splinePointer);
    }

    const getSplinePositionAtDistance = (splinePointer, distance) => {
        const { getSplinePositionAtDistance : func, memory } = instance.exports;
        const positionPointer = func(splinePointer, distance);
        return new Float32Array(memory.buffer, positionPointer, 3);
    }

    const createSpline = (p0, p1, p2, p3) => {
        const { createSpline : func, malloc, memory } = instance.exports;

        const pointers = [p0, p1, p2, p3].map(point => {
            const pointer = malloc(3 * 4); // (x, y, z) * 4 bytes
            new Float32Array(memory.buffer, pointer, 3).set(point);
            return pointer;
        })

        return func(pointers[0], pointers[1], pointers[2], pointers[3]);
    }

    return {
        createSpline,
        getSplinePositionAtDistance,
        getSplineLength
    };
};

export default libCalculation;