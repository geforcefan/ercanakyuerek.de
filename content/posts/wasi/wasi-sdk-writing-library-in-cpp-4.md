---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - JavaScript module"
date: 2023-02-27T17:45:00+01:00
---
[If you haven't read the third article of this series, I highly recommend that you do so.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-3.md" >}})

This is the point where we will develop our ``JavaScript`` library that utilizes the functions exposed in the ``WebAssembly`` module. I have created a simple template for this purpose. You may notice that we are defining some imports for ``WASI``, but they are all empty. Allow me to explain what ``WASI`` is and what it aims to achieve. ``WASI`` is an attempt to create specifications similar to the ``POSIX`` standard, which can be implemented across different runtimes, such as browsers or regular machines, and provides access to system-specific functions, such as file systems. However, for our library, which only needs to perform calculations, we do not require a complex runtime environment. This is why our functions are empty. Some may argue that we should use the Emscripten SDK instead of the ``WASI SDK``, but I believe that the ``WASI SDK`` is the future. It produces smaller binaries and has fewer complications compared to ``Emscripten``. There are official efforts to import standard ``WASI`` functions for the ``browser``, but unfortunately, they do not seem to work unless a ``WebAssembly module`` is instantiated within a ``worker``. If there are any changes in the future regarding this matter, I will update my articles accordingly. [Here](https://github.com/wasmerio/wasmer-js) is the mentioned attempt to bring a ``WASI runtime`` to ``browsers``. If you can load a ``WASM file`` outside the ``worker``, just email me your solution and I will include it here! :smile:

## Instantiate a module

Let's create a small boilerplate code for this purpose in the ``index.js`` file:

```javascript
import glue from "./glue.wasm";

const libCalculation = async () => {
    const memory = new WebAssembly.Memory({
        initial: 10000,
        maximum: 10000,
    });

    const module = await WebAssembly.compile(glue);
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

    // ... here comes our wrapped functions
    
    return {
        // ... going to export them here
    };
};

export default libCalculation;
```

We will need to discuss memory later, particularly linear memory. For now, let's wrap some WebAssembly functions. We will start with an easy one, ``getSplineLength``. We can get the function from the ``instance.exports`` and call it with the spline pointer. This function returns a float, so there is no need for any special handling here:

```javascript
const getSplineLength = (splinePointer) => {
    const { getSplineLength : func } = instance.exports;
    return func(splinePointer);
}
```

Let's move on to a more complicated function, ``getSplinePositionAtDistance``. We also need to get the function from the exports and call it with the ``spline pointer`` and a ``distance``. However, we need to handle the ``3D vector`` pointer from the function's return in order to extract the float ``x, y, and z`` values from the ``3D vector``.The ``3D vector`` includes three ``float`` values. That's why we use ``Float32Array`` instead of ``Float64Array``, which would be used for doubles. The first argument is the memory itself, the second one is the ``position`` in the ``memory`` (a pointer is simply a number), and we want to extract ``3x 32bit values``, which perfectly match ``3x float for x, y, and z``.

```javascript
const getSplinePositionAtDistance = (splinePointer, distance) => {
    const { getSplinePositionAtDistance : func, memory } = instance.exports;
    const positionPointer = func(splinePointer, distance);
    return new Float32Array(memory, positionPointer, 3);
}
```