---
title: Coaster Studio
---

{{< figure src="/images/coaster-studio-hero.jpg" alt="Coaster Studio, a train in an inversion at low sun" >}}

Welcome to Coaster Studio, and to its workshop. I always wanted to write my own coaster simulator,
not a tool around somebody else's but my own, and this is me finally doing it. On this page I show
what I build, what breaks, and what I throw away again.

## Why another simulator

Back in 2005, when I was around fourteen, NoLimits was one of the main reasons I started writing
software in the first place.

NoLimits 2 is still the reference for most of us today. But it has not really developed in the last
years, and there are no official options for user mods, only hacked data assets.

Track styles, trains, models, all of that is baked into the engine. You can inject a few things
through those assets, but you cannot really customise them, because a track style is part of the
engine itself.

There is a scripting engine, which is good to have. But scripting cannot be the answer to
everything.

A lot of things should simply be data. Declarative, editable, shareable. No script required.

So I thought: let us do this in a more modern way.

## Try it right now

Here is the latest build, the actual application, running in your browser. Whatever state the
development is in, this is it, and it will always show the newest state, so stay tuned.

{{< embedded-iframe src="https://geforcefan.github.io/roller-coaster-simulator/latest/?park=hybris&editor=0&start_simulation=1" height="650px" >}}

## Play around with FVD

If you feel like building something yourself, there is a version with an FVD park preloaded. Draw
the forces, watch the track follow, break it as much as you like.

[Open the FVD sandbox](https://geforcefan.github.io/roller-coaster-simulator/latest/?park=fvd)

## Two targets, one code base

Coaster Studio runs in the browser and in Unreal Engine 5.

The browser version is a bit selfish, I have to say. I am a Mac guy, I love macOS, and our GPU
options are bad. I wanted something that runs smooth and still looks good on my MacBook M4 Pro.

So I ended up at [Google Filament](https://google.github.io/filament/), compiled to WebAssembly and
running in a browser tab.

At the same time I wanted an Unreal Engine 5 version, for everything a real GPU and a big renderer
can give to a ride.

What I did not want was to build every feature twice: an actor here, a component there, and two
versions that slowly grow apart.

## React, in C++

So I did something unholy: I built React for C++.

When I posted it, a lot of people on
[Reddit](https://www.reddit.com/r/gameenginedevs/comments/1urkusg/i_built_react_for_c/) hated it. I
partly understand it, in the C++ world you read React and think web user interface framework, and
there it ends. But not one of them really got which problem React solves.

React itself is very simple in its principle. There is a function that describes how something is
composed, and there is a reconciliation that looks if a component has changed, triggers an update
and updates the internal node graph. That is all.

And it is not only about user interfaces, that is the part people get wrong. A park is a node graph
too, and so is the scene in any engine. One component tree describes the park, another one the user
interface, and Filament, Unreal Engine 5 or the glTF exporter decide what those elements mean on
their side.

So the hate is fine by me. It solves big problems for me, and it is not for everyone.

## Feedback, and a Discord

There is a Discord for this, and it did not start with me.
[Veia](https://discord.com/users/290477758440669184) opened it for the openFVD++ revival, and he put
a lot of work into that project: he made the application modern again and got rid of Qt. Big props
for that, and special thanks.

The group was made to collect feedback for the new openFVD version, and it is now also the place for
Coaster Studio feedback. Come in and tell me what is wrong with it.

{{< discord-link url="https://discord.gg/b5eQ5EFdjY" >}}
