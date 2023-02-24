---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - Implementing library functions"
date: 2023-02-24T00:19:00+01:00
---
[If you haven't read the second article of this series, I highly recommend that you do so.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-2.md" >}})

In this article, we'll be exploring a more interesting example where we'll construct a bezier curve, evaluate nodes on it, and write a function that gives any position on the curve by a length parameter. To explain briefly, a bezier curve is represented by a parameter ``t``, which varies between 0 and 1 and determines the position of nodes on the curve. However, this ``t`` value doesn't produce uniform spacing, which is problematic when we want to evaluate a point on the curve based on its distance. To solve this, we can evaluate some nodes along the curve with known distances and then linearly interpolate new nodes between them to find the point we're looking for.

While this is a specific example, it involves "complex" types such as custom structs and 3D vectors that will need to be accessed from a web browser. So it should serve as a useful case for testing our library :smile:

## Adding a third party library
I mentioned 3D vectors, so there is a well-known library called ``glm``. I know that this is an overkill library for our "simple" problem, but it serves the purpose of showing how to add other libraries to our project. Ideally, the 3rd party library also has a CMake ecosystem. Otherwise, we need to be creative, fortunately. ``glm`` provides CMake files. My approach is to add a git submodule into the root directory by calling:

```
git submodule add https://github.com/g-truc/glm.git
```

We must include the glm directory as an include in our root ``CMakeList.txt``, as the glm library is a header-only library and does not need to be linked against anything:

```
include_directories(glm)
```

## Spline implementation
I don't want to go into too much detail, but I have implemented a solution for the problem described above. Stay tuned for the upcoming section where I'll walk you through the implementation step-by-step.