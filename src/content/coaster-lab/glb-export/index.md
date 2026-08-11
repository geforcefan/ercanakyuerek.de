---
title: 'Exporting a whole park as animated glTF'
date: 2026-08-10T11:00:00+01:00
type: posts
tags: ['coaster studio']
aliases: ['/coaster-studio/glb-export/']
---

Coaster Lab can write a whole park into a binary glTF file: track, supports, train, cameras, the
sun, and the ride itself as animation. That works because the exporter is not really an exporter, it
is just another host.

The scene is the React style component tree from
[one core, two and a half engines]({{< ref "/coaster-lab/one-core-two-engines" >}}), written in
C++ on [cppreact](https://github.com/geforcefan/cppreact). Components build the park out of engine
elements, a mesh, a camera, a light, and what such an element means is up to the host.

Unreal Engine 5 is one host and makes Unreal components out of them. Google Filament is another one
and makes engine entities out of them. The exporter is the third one, and the only real difference
is where the result goes: into a file instead of into the GPU. Same tree, same elements, same
props.

The ride comes for free. The exporter runs the frames itself, in fixed steps, and ticks the same
simulation the other hosts tick. Every transform a component writes during that run becomes a
keyframe, so the file holds what the simulation really did.

## The scene I prepared

The layout is the one Keltan Kemp gave me, the same track as in the
[NURBS demo]({{< ref "/posts/roller-coaster-simulation/nurbs-roll-physics-in-action" >}}), built as
an Intamin style launch coaster.

This is the real application, compiled to WebAssembly and drawn by Filament. You start in the train
with the simulation paused. Press play.

{{< embedded-iframe src="https://geforcefan.github.io/roller-coaster-simulator/latest/?park=keltan-kemp&editor=0&start_simulation=1" height="650px" >}}

## The same scene, in Blender

Now the same park through the export host instead. This is what it looks like in Blender:

{{< figure src="blender-viewport.png" alt="the exported ride opened in Blender, track geometry and the train on it" >}}

Open the glb in whatever you use, Blender in my case, and it is all there, the animations, the
cameras, the train on the track: [glb-export-example.glb](/downloads/glb-export-example.glb).
