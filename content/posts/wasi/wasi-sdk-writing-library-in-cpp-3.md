---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - Implementing library functions"
date: 2023-02-24T00:19:00+01:00
---
[If you haven't read the second article of this series, I highly recommend that you do so.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-2.md" >}})

{{< iframe "wasi-sdk-writing-library-in-cpp/spline.html" >}}

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
In summary, I have developed a solution for the problem discussed earlier, but I won't delve too deeply into the technical details. The primary function of my implementation, ``bezier_fast``, computes the position on a bezier curve based on a given ``t`` parameter. Additionally, ``estimate_length`` is used to calculate the curve's length very quickly with a ``low step size``. This estimation is necessary to determine how many nodes we should evaluate. With this method, we can create densely populated nodes depending on the curve's length. The evaluate function executes the procedure I just described. Naturally, we can always measure the distance between the evaluated position and the previous one to obtain the curve's total length, which we simply pass through the ``get_length`` function. Lastly, ``get_position_at_distance`` searches for the minimum node at a specified distance and linearly interpolates the position to the next node. We have successfully achieved the ability to evaluate uniformly spaced points on the curve.

``src/spline.cc:``

````cpp
#include "spline.h"
#include <glm/geometric.hpp>

void spline::evaluate() {
    int numberOfNodes = (int)(estimate_length() * 20.0f);
    glm::vec3 lastPos = cp1;

    for(int i=0; i < numberOfNodes; i++) {
        float t = (float) i / (float) (numberOfNodes - 1);

        glm::vec3 position = bezier_fast(cp1, cp2, cp3, cp4, t);
        float distance = glm::distance(position, lastPos);

        nodes.push_back({
            .position = position,
            .distance = distance
        });

        lastPos = position;
    }
}

glm::vec3 spline::bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t) {
    float t1 = 1.0f-t;
    float b0 = t1 * t1 * t1;
    float b1 = 3 * t1 * t1 * t;
    float b2 = 3 * t1 * t * t;
    float b3 = t * t * t;

    return b0 * p0  + b1 * p1 + b2 * p2 + b3 * p3;
}

float spline::estimate_length() {
    glm::vec3 lastPos = cp1;
    float length = 0.0f;

    for(int i=0; i < 15; i+= 2) {
        float t = (float) (i) / 14.0f;
        glm::vec3 pos = bezier_fast(cp1, cp2, cp3, cp4, t);
        length += glm::distance(pos, lastPos);
        lastPos = pos;
    };

    return length;
}

glm::vec3 spline::get_position_at_distance(float distance) {
    if (nodes.size() < 2) return glm::vec3(0.0f);

    auto nextNode = std::lower_bound(nodes.begin(), nodes.end(), distance, [](auto a, double value) -> bool { return a.distance < value; });
    auto currentNode = nextNode - 1;

    auto isFirst = nextNode == nodes.begin();
    auto isLast = currentNode == nodes.end();

    if (isFirst) return nodes[0].position;
    if (isLast) return nodes[nodes.size() - 1].position;

    double t = 0.0;

    if (nextNode->distance - currentNode->distance > std::numeric_limits<double>::epsilon()) {
        t = std::max(std::min((distance - currentNode->distance) / (nextNode->distance - currentNode->distance), 1.0f), 0.0f);
    }

    return glm::mix(currentNode->position, nextNode->position, t);
}

float spline::get_length() {
    if(!nodes.empty()) return nodes[nodes.size() - 1].distance;

    return 0;
}
````

``src/spline.h:``

```cpp
#ifndef LIBCALCULATION_SPLINE_H
#define LIBCALCULATION_SPLINE_H

#include <glm/vec3.hpp>
#include <vector>

struct node {
    glm::vec3 position;
    float distance;
};

class spline {
public:
    spline(const glm::vec3 &cp1, const glm::vec3 &cp2, const glm::vec3 &cp3, const glm::vec3 &cp4) : cp1(cp1), cp2(cp2),
                                                                                                     cp3(cp3),
                                                                                                     cp4(cp4) {
        evaluate();
    }

    glm::vec3 get_position_at_distance(float distance);
    float get_length();

private:
    glm::vec3 cp1, cp2, cp3, cp4;
    std::vector<node> nodes;

    static glm::vec3 bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t);
    float estimate_length();
    void evaluate();
};

#endif //LIBCALCULATION_SPLINE_H
```

## Gluing the Pieces of our library
We still cannot use the functions yet, so we need to create glue code to expose them to the outside world. Our goal is to use this spline library in our browser, for example, to draw a uniformly spaced Bezier curve. We will expose three functions: ```createSpline```, ```getSplineLength```, and ```getSplinePositionAtDistance```. Some of these functions return complex types, such as a ```3D vector```, which we will handle on the JavaScript side. There are many techniques to pass complex data from and to our WebAssembly module, which we will discuss in detail later. For now, let's focus on creating some glue code in ``glue/glue.cc``.

### Data types
As mentioned several times before, passing complex data types in and out can be challenging, but it can be managed. Passing 32 and 64 bit integers and decimal numbers is natively supported, so there is no need to worry about those. However, passing types such as a ```3D vector``` is a different matter. We need to allocate memory on the JavaScript side, assign the ```3D vector``` data (3x ```floats```) to a free memory space, and pass the location (pointer) to the function calls. If we return complex data from the WebAssembly module, we will get a pointer and access the data in memory and "demangle" it (for example, using ```Float64Array``` with the pointer as offset and length of 3 to access x, y, z data). We will delve deeper into this later.

### createSpline function
This is a straightforward process. We replicate the original constructor and expose this new function using the ```attribute((export_name("createSpline")))``` attribute to make it available to the outside world. As shown, we return a pointer, which will be a number on the JavaScript side and can be used to access memory data later. To ensure that we can access the data of the 3d vector in memory on the JavaScript side, it is crucial that the parameters of the vector are also pointers. This is because we allocate memory on the JavaScript side and assign our vector data to that memory location.:

```cpp
__attribute__((export_name("createSpline")))
spline *createSpline(glm::vec3 *cp1, glm::vec3 *cp2, glm::vec3 *cp3, glm::vec3 *cp4) {
    return new spline(*cp1, *cp2, *cp3, *cp4);
}
```

### getSplineLength function
This function returns a ```float```, so no need to handle any extra complex data stuff on the JavaScript side:

```cpp
__attribute__((export_name("getSplineLength")))
float getSplineLength(spline *s) {
    return s->get_length();
}
```

### getSplinePositionAtDistance function
This function returns a pointer to a ``3d vector``, which allows us to access its data in memory on the ``JavaScript`` side. Therefore, we need to allocate a new space for the returned ``3d vector``:

```cpp
__attribute__((export_name("getSplinePositionAtDistance")))
glm::vec3 *getSplinePositionAtDistance(spline *s, float distance) {
    return new glm::vec3(s->get_position_at_distance(distance));
}
```

## Build
At this point, you can run a build by executing ``npm run build``. It should compile without any errors. In the next section, we will create a small ``JavaScript`` module that initializes the ``WebAssembly`` module, wraps the exposed functions, and handles incoming and outgoing data types. This ``JavaScript`` module can be used in your project just like any other ``ES6 module``.