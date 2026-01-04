---
title: 'JavaScript module'
date: 2023-02-27T17:45:00+01:00
tags:
  [
    'writing a library in c++ and using it in the browser with the WASI SDK',
  ]
---

This is the point where we start writing the **JavaScript** side of the library that talks to our **WebAssembly** module.

At this stage, the WebAssembly part already exists and exposes a couple of useful functions. What we need now is a small JavaScript wrapper that loads the module, wires things together, and gives us a nicer API to work with.

I have created a very basic template for this. You may notice that we define a number of imports for **WASI**, but all of them are empty. This looks suspicious at first, so let us talk about that.

**WASI** is an attempt to define a standard interface similar to **POSIX**, but for WebAssembly. The idea is that the same WebAssembly module can run in different environments, such as browsers or native runtimes, while still having access to things like the file system or environment variables.

In our case, we do not need any of that. Our library only performs calculations. There is no file system access, no I/O, and no real interaction with the outside world. Because of that, we can provide empty implementations for all required WASI functions and move on.

Some people may argue that using **Emscripten** instead of the **WASI SDK** would make things easier. That is probably true today. Still, I believe that **WASI** is the direction things are moving toward. The binaries are smaller, the setup is simpler, and there is less magic involved.

There are ongoing efforts to make standard WASI runtimes work directly in the browser. Unfortunately, at the time of writing, this still requires instantiating the WebAssembly module inside a **worker**. If this ever changes, I will update this article.

For reference, [this project](https://github.com/wasmerio/wasmer-js) is one such attempt to bring a WASI runtime to the browser. And if you somehow manage to load a WASM file with full WASI support outside of a worker, feel free to email me. I would genuinely like to see that.

## Instantiate a module

We start with a bit of boilerplate code in `index.ts` to load and instantiate the WebAssembly module:

```typescript
// @ts-ignore
import glue from './glue.wasm';

const module = await WebAssembly.compileStreaming(fetch(glue));

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
});
```

We will talk about memory later, especially linear memory. For now, we can already start wrapping exported WebAssembly functions.

We begin with a very simple one: `bezierTotalArcLength`. We grab the function from `instance.exports` and call it with a pointer to a Bezier curve. Since the function returns a single float, there is nothing special to do here.

```typescript
export const bezierTotalArcLength = (bezierPointer: number) => {
  const { bezierTotalArcLength: func } = instance.exports as any;
  return func(bezierPointer);
};
```

Next is a slightly more interesting function: `bezierPositionAtArcLength`.

This function also lives in the exports and takes a Bezier pointer plus a distance. The difference is that it returns a pointer to a **3D vector** instead of a plain number.

A 3D vector here is just three `float` values laid out next to each other in linear memory. Because these are `32-bit` floats, we use a `Float32Array` to read them back. The pointer returned from WebAssembly is simply an offset into the memory buffer.

```typescript
export const bezierPositionAtArcLength = (
  bezierPointer: number,
  at: number,
) => {
  const { bezierPositionAtArcLength: func, memory } =
    instance.exports as any;
  const positionPointer = func(bezierPointer, at);
  return new Float32Array(memory.buffer, positionPointer, 3);
};
```

Now we reach a more involved function: `bezierFromPoints`.

This function takes four control points, each represented as a 3D vector. That means we need to pass `4 × 3` floats to WebAssembly. Each float is `32-bit`, so we are dealing with `48 bytes` of memory in total.

There are multiple ways to handle this. We could allocate one block of `48 bytes`, or we could allocate memory for each point individually. For now, we do the latter and call `malloc` four times with `12 bytes` each.

This is not perfect. There are limitations and edge cases here. That is fine for now. We will improve this later once things get more serious.

On the JavaScript side, we allocate memory, write the coordinates into linear memory, and then pass the pointers to the WebAssembly function.

```typescript
export const bezierFromPoints = (
  p0: number[],
  p1: number[],
  p2: number[],
  p3: number[],
) => {
  const {
    bezierFromPoints: func,
    malloc,
    memory,
  } = instance.exports as any;

  const pointers = [p0, p1, p2, p3].map((point) => {
    const pointer = malloc(3 * 4); // (x, y, z) * 4 bytes
    new Float32Array(memory.buffer, pointer, 3).set(point);
    return pointer;
  });

  return func(pointers[0], pointers[1], pointers[2], pointers[3]);
};
```

# Demo

To make this less abstract, there is an interactive demo where you can drag control points around and see the Bezier calculations happen inside the WebAssembly module.

{{< embedded-content-component path="./posts/wasi/javascript-module/WasiLibraryExampleScene.tsx" width="100%" height="300px">}}

## Conclusion

That is it for now.

We have not covered everything yet. Passing strings, logging, more complex data structures, and proper memory management are all still missing. But at this point, you should have a reasonable idea of how JavaScript and WebAssembly talk to each other.

To be honest, writing glue code like this is not particularly fun. It usually means writing code twice: once in C++ and once again in JavaScript to serialize and deserialize arguments. There are tools that try to automate this, but for small, performance-critical libraries, doing it manually is still a very common approach.

In the next articles, we will dig deeper into memory, data types, and better bindings.

# Demo code

{{< show-content-script "posts/wasi/javascript-module/WasiLibraryExampleScene.tsx" >}}
