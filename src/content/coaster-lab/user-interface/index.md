---
title: 'The user interface, written once'
date: 2026-08-10T07:30:00+01:00
type: posts
tags: ['coaster studio', 'c++react']
aliases: ['/coaster-studio/user-interface/']
---

The user interface of Coaster Lab is not written per host. It is C++ in the core, like everything
else, and every host shows the same one. Not a rebuilt copy, the same components and the same
stylesheets.

Here is the same toolbar, once in Unreal Engine 5 and once in the Filament build:

{{< figure src="ue5.png" alt="the Coaster Lab toolbar in Unreal Engine 5" caption="Unreal Engine 5" >}}

{{< figure src="filament.png" alt="the Coaster Lab toolbar in the Filament build" caption="Google Filament" >}}

Same padding, same radius, same blur behind the panel, same icons. Nobody keeps those two in sync,
they cannot drift apart, because there is only one of them.

## How it is built

The interface is written with [cppreact](https://github.com/geforcefan/cppreact), the same library
that carries the scene, and it is drawn by [RmlUi](https://github.com/mikke89/RmlUi). So RmlUi is a
host as well, just for the user interface instead of the scene: cppreact says what should be there,
RmlUi turns it into a document on screen.

A component looks the way you would expect:

```cpp
struct ButtonProps {
  ButtonVariant variant = ButtonVariant::Default;
  bool disabled = false;
  EventCallback on_click{};
  Children children{};
};
```

```cpp
atoms::Button({
    .on_click = bump,
    .children = {"Apply"},
})
```

What a button looks like is not decided in C++. C++ carries the state, the look lives in
stylesheets, in RCSS, which is close enough to CSS that you can read it without learning anything
new:

```css
.button {
	line-height: var(--control-height);
	padding: 0dp var(--space-lg);
	border: var(--border-width) var(--border-transparent);
	border-radius: var(--radius-md);
	transition: background-color border-color var(--animation-md-out);
}

.button-default { background-color: var(--primary); border-color: var(--primary-border); }
.button-default:hover { background-color: var(--primary-hover); }
```

Every size and every color is a token, and all tokens live in one theme file. Sizes are in `dp`, so
the whole interface scales with the display, which is the reason a retina Mac and a normal monitor
show the same thing at the right size.

## RmlUi fixes

If you use a library this hard, you find bugs. I fixed them when I ran into them and keep them as
patch files next to the vendored sources, so every build gets them:

- corner radii were wrong
- transitions never worked with `var()`
- flex layout was slow
- text in transformed elements was blurry

My favourite one: text had the wrong size on Unreal Engine 5 and the right size on the web. On a
display scale change RmlUi refreshes by unit, and a `dp` inside a `var()` was never resolved again.
My fix worked and still ate the frame rate, so I closed my own pull request and solved it
differently.

## There is no Unreal Engine 5 backend for RmlUi

RmlUi ships backends for OpenGL, Vulkan and DirectX, but none for Unreal Engine 5, so I had to write
one. A backend takes the geometry RmlUi produces and puts it on the screen.

I started on Slate, the widget system Unreal Engine uses for its own editor, because I knew almost
nothing about RHI back then. But Slate only composes what is already drawn, no render targets, no
shader filters, and the frosted glass behind my panels needs exactly that: take what is behind the
window, blur it, draw the panel on top.

So the user interface has its own RHI backend now, RHI being the layer right above Metal, Vulkan and
D3D. It draws after the tone mapping into the same image as the scene, with blur, gradients, clip
masks and MSAA, and it is significantly less code than the Slate path.

At some point I will probably release that part as open source. And I will probably get hate on
Reddit again, because how dare I bring web principles into C++.

How the scene side of the same idea works is in
[one core, two and a half engines]({{< ref "/coaster-lab/one-core-two-engines" >}}).
