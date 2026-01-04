---
title: "Implementing library functions"
date: 2023-02-24T00:19:00+01:00
tags: ["writing a library in c++ and using it in the browser with the WASI SDK"]
---
{{< embedded-content-component path="./posts/wasi/implementing-library-functions/BezierNodesExampleScene.tsx" class="float-right" width="225px" height="225px" description="Transition from parameter-based non-uniform to uniform node spacing. The control points are draggable." >}}

In this article, we'll be exploring a more interesting example where we'll construct a Bézier curve, evaluate nodes on it, and write a function that gives any position on the curve by a length parameter. To explain briefly, a Bézier curve is represented by a parameter ``t``, which varies between 0 and 1 and determines the position of nodes on the curve. However, this ``t`` value doesn't produce uniform spacing, which is problematic when we want to evaluate a point on the curve based on its distance. To solve this, we can evaluate some nodes along the curve with known distances and then linearly interpolate new nodes between them to find the point we're looking for.

While this is a specific example, it involves "complex" types such as custom structs and 3D vectors that will need to be accessed from a web browser. So it should serve as a useful case for testing our library :smile:

## Adding a third party library
I mentioned 3D vectors, so there is a well-known library called ``glm``. I know that this is an overkill library for our "simple" problem, but it serves the purpose of showing how to add other libraries to our project. Ideally, the 3rd party library also has a CMake ecosystem. Otherwise, we need to be creative, fortunately. ``glm`` provides CMake files. My approach is to add a git submodule into the root directory by calling:

```bash
git submodule add https://github.com/g-truc/glm.git
```

We must include the glm directory as an include in our root ``CMakeList.txt``, as the glm library is a header-only library and does not need to be linked against anything:

```cmake
include_directories(glm)
```

## Bezier implementation
In summary, I have developed a solution for the problem discussed earlier, but I won't delve too deeply into the technical details. The primary function of my implementation, ``bezier_fast``, computes the position on a bezier curve based on a given ``t`` parameter. Additionally, ``estimate_total_arc_length`` is used to estimate the curve's total arc length very quickly with a **low step size**. This estimation is necessary to determine how many nodes we should evaluate. With this method, we can create densely populated nodes depending on the curve's total arc length. The evaluate function executes the procedure I just described. Naturally, we can always measure the distance between the evaluated position and the previous one to obtain the curve's total arc length, which we simply pass through the ``total_arc_length`` function. Lastly, ``position_at_arc_length`` searches for the minimum node at a specified distance and linearly interpolates the position to the next node. We have successfully achieved the ability to evaluate uniformly spaced points on the curve.

``src/bezier.cc:``

````cpp
#include "bezier.h"
#include <glm/geometric.hpp>

void bezier::evaluate() {
    nodes.clear();
    int numberOfNodes = (int)(estimate_total_arc_length() * 20.0f);
    if(!numberOfNodes) return;

    float arcLength = 0.0f;
    glm::vec3 lastPos = cp1;

    for(int i=0; i < numberOfNodes; i++) {
        float t = (float) i / (float) (numberOfNodes - 1);

        glm::vec3 position = bezier_fast(cp1, cp2, cp3, cp4, t);
        arcLength += glm::distance(position, lastPos);

        nodes.push_back({
            .position = position,
            .arcLength = arcLength
        });

        lastPos = position;
    }
}

glm::vec3 bezier::bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t) {
    float t1 = 1.0f-t;
    float b0 = t1 * t1 * t1;
    float b1 = 3 * t1 * t1 * t;
    float b2 = 3 * t1 * t * t;
    float b3 = t * t * t;

    return b0 * p0  + b1 * p1 + b2 * p2 + b3 * p3;
}

float bezier::estimate_total_arc_length() {
    glm::vec3 lastPos = cp1;
    float totalArcLength = 0.0f;

    for(int i=0; i < 15; i+= 2) {
        float t = (float) (i) / 14.0f;
        glm::vec3 pos = bezier_fast(cp1, cp2, cp3, cp4, t);
        totalArcLength += glm::distance(pos, lastPos);
        lastPos = pos;
    };

    return totalArcLength;
}

glm::vec3 bezier::position_at_arc_length(float at) {
    if (nodes.size() < 2) return glm::vec3(0.0f);

    auto nextNode = std::lower_bound(nodes.begin(), nodes.end(), at, [](auto a, double value) -> bool { return a.arcLength < value; });
    auto currentNode = nextNode - 1;

    auto isFirst = nextNode == nodes.begin();
    auto isLast = currentNode == nodes.end();

    if (isFirst) return nodes[0].position;
    if (isLast) return nodes[nodes.size() - 1].position;

    double t = 0.0;

    if (nextNode->arcLength - currentNode->arcLength > std::numeric_limits<double>::epsilon()) {
        t = std::max(std::min((at - currentNode->arcLength) / (nextNode->arcLength - currentNode->arcLength), 1.0f), 0.0f);
    }

    return glm::mix(currentNode->position, nextNode->position, t);
}

float bezier::total_arc_length() {
    if(!nodes.empty()) return nodes[nodes.size() - 1].arcLength;

    return 0;
}
````

``src/bezier.h:``

```cpp
#ifndef LIBCALCULATION_BEZIER_H
#define LIBCALCULATION_BEZIER_H

#include <glm/vec3.hpp>
#include <vector>

struct node {
    glm::vec3 position;
    float arcLength;
};

class bezier {
public:
    bezier(const glm::vec3 &cp1, const glm::vec3 &cp2, const glm::vec3 &cp3, const glm::vec3 &cp4) : cp1(cp1),
                                                                                                     cp2(cp2),
                                                                                                     cp3(cp3),
                                                                                                     cp4(cp4) {
        evaluate();
    }

    glm::vec3 position_at_arc_length(float distance);
    float total_arc_length();

private:
    glm::vec3 cp1, cp2, cp3, cp4;
    std::vector<node> nodes;

    static glm::vec3 bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t);
    float estimate_total_arc_length();
    void evaluate();
};

#endif //LIBCALCULATION_BEZIER_H
```

## Gluing the Pieces of our library
We still cannot use the functions yet, so we need to create glue code to expose them to the outside world. Our goal is to use this bezier library in our browser, for example, to draw a uniformly spaced Bezier curve. We will expose three functions: ```bezierFromPoints```, ```bezierPositionAtArcLength```, and ```bezierTotalArcLength```. Some of these functions return complex types, such as a ```3D vector```, which we will handle on the JavaScript side. There are many techniques to pass complex data from and to our WebAssembly module, which we will discuss in detail later. For now, let's focus on creating some glue code in ``glue/glue.cc``.

### Data types
As mentioned several times before, passing complex data types in and out can be challenging, but it can be managed. Passing 32 and 64 bit integers and decimal numbers is natively supported, so there is no need to worry about those. However, passing types such as a ```3D vector``` is a different matter. We need to allocate memory on the JavaScript side, assign the ```3D vector``` data (3x ```floats```) to a free memory space, and pass the location (pointer) to the function calls. If we return complex data from the WebAssembly module, we will get a pointer and access the data in memory and "demangle" it (for example, using ```Float64Array``` with the pointer as offset and length of 3 to access x, y, z data). We will delve deeper into this later.

### bezierFromPoints function
This is a straightforward process. We replicate the original constructor and expose this new function using the ```attribute((export_name("bezierFromPoints")))``` attribute to make it available to the outside world. As shown, we return a pointer, which will be a number on the JavaScript side and can be used to access memory data later. To ensure that we can access the data of the 3d vector in memory on the JavaScript side, it is crucial that the parameters of the vector are also pointers. This is because we allocate memory on the JavaScript side and assign our vector data to that memory location.:

```cpp
__attribute__((export_name("bezierFromPoints")))
bezier *bezierFromPoints(glm::vec3 *cp1, glm::vec3 *cp2, glm::vec3 *cp3, glm::vec3 *cp4) {
    return new bezier(*cp1, *cp2, *cp3, *cp4);
}
```

### bezierTotalArcLength function
This function returns a ```float```, so no need to handle any extra complex data stuff on the JavaScript side:

```cpp
__attribute__((export_name("bezierTotalArcLength")))
float bezierTotalArcLength(bezier *s) {
    return s->total_arc_length();
}
```

### bezierPositionAtArcLength function
This function returns a pointer to a ``3d vector``, which allows us to access its data in memory on the ``JavaScript`` side. Therefore, we need to allocate a new space for the returned ``3d vector``:

```cpp
__attribute__((export_name("bezierPositionAtArcLength")))
glm::vec3 *bezierPositionAtArcLength(bezier *s, float at) {
    return new glm::vec3(s->position_at_arc_length(at));
}
```

### malloc
I understand that this may not be the most optimal approach for memory allocation, but it is currently working for my purposes. I may consider revising my implementation at a later time, but for now, we can utilize the ``malloc`` function from the ``JavaScript`` side. This is necessary for allocating memory to data that we want to pass to the ``WebAssembly`` functions, such as ``3D vectors``.

```cpp
__attribute__((export_name("malloc")))
void *allocateMemory(size_t size) {
    return malloc(size);
}
```

## Build
At this point, you can run a build by executing ``npm run build``. It should compile without any errors. In the next section, we will create a small ``JavaScript`` module that initializes the ``WebAssembly`` module, wraps the exposed functions, and handles incoming and outgoing data types. This ``JavaScript`` module can be used in your project just like any other ``ES6 module``.

[Now, let's create a small JavaScript module that will be responsible for creating a WebAssembly module, loading our Wasm file, defining some imports for WASI (which will mostly be empty), and creating functions for those that we exported in our C++ glue code.]({{< ref "/posts/wasi/javascript-module.md" >}})