---
title: 'NoLimits 2 Utilities for Blender'
date: 2026-09-06T20:00:00+01:00
tags: ['nolimits 2', 'blender']
---

I finally figured out how NoLimits 2 builds its track. Not roughly, exactly: the NURBS from the
vertices, the frames along it, the roll between the roll points and the heartline on top. That
has been on my list for years, as a side project, and because
[Coaster Lab]({{< ref "/coaster-lab" >}}) has its own curve library and I wanted to know how
close I am.

Then it hit me. Back in 2015 I wrote
[BlenderNoLimitsCSVImporter](https://github.com/geforcefan/BlenderNoLimitsCSVImporter), a small
extension that turns exactly that csv export into a Blender curve. People still use it, and it has
one big catch: the csv export only exists in the Professional version of NoLimits 2. With the
normal version you were out.

Now I do not need the export anymore, I can read the .nl2park itself. So I retired the old
extension and started a new one.

{{< figure src="blender-track.jpg" alt="a NoLimits 2 track imported into Blender, center of rails and editor spline as two curves" >}}

## The track import

- Pick a park and you get a curve object per track. Coaster and track are selectable in the
  curve panel.
- Center of rails or editor spline, the heartline comes from the coaster style or you set your
  own.
- Every change rebuilds the curve. Reload reads the file again after you saved in NL2.
- The csv track spline export still imports, if you have it.
- The roll near vertical track that the old extension got wrong is fixed.

## Installation

The extension is installed from a remote repository, so updates come through Blender itself.
The [GitHub page](https://github.com/geforcefan/blender-nolimits2-utilities) has detailed
instructions with screenshots, and the zip for a manual install is on the releases page there.

It is still in alpha stage, so feel free to report bugs on
[GitHub](https://github.com/geforcefan/blender-nolimits2-utilities/issues).

## What is open

Terrain import is next, maybe supports after that, maybe something else, who knows.
