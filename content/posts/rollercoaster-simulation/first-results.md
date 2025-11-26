---
title: "Roller Coaster Simulation - First results"
date: 2023-02-23T16:28:20+01:00
---
I am in the process of developing an open source roller coaster simulator that is designed to achieve a high degree of compatibility with NoLimits 2. To this end, I have adopted the same track generation and roll interpolation techniques employed by NoLimits 2. Although there are some bugs associated with loading NoLimits2 Parks at present, I anticipate that these issues will be resolved in due course, as I continue to refine the nl2park loader.

At this point in time, the simulator does not support a block system or multi-track functionality. However, I am actively working on implementing these features. It is worth noting that the simulator runs in a browser, and has been written in c++ and compiled to WebAssembly. Consequently, a lightweight version of the software is available for use in web browsers, while the desktop version is built using Unreal Engine 5.

To give you a better idea of the current implementation of the simulator, I have created an interactive example for you to try. You can switch between two coasters from the NoLimits2 library, change the camera perspective, and live adjust gravity and friction. Please note that since the user interface library I am using has no capabilities to allow more than two decimal points, there are no adjustment options for air resistance. Additionally, the track itself is not yet connected, and the sections only provide simple acceleration and deceleration on sections without a block system.

{{< simulator 1 >}}
