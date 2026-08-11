---
title: 'One core, two and a half engines'
date: 2026-08-10T08:00:00+01:00
type: posts
tags: ['coaster lab', 'c++react']
aliases: ['/coaster-studio/one-core-two-engines/']
---

Coaster Lab runs on Unreal Engine 5 and on Google Filament, in the browser and on the desktop.
Same application, same user interface. Two engines, and the glTF exporter as the half one, because
it hosts the same scene without rendering a single pixel.

Everything that matters lives in one portable C++ core: math, curves, force vector design, physics,
the data model, saving and loading, the scene and the whole user interface. A host only brings an
engine, a window and the input.

Same park, same seat, same code, during a ride on Hybris:

{{< figure src="ue5.png" alt="Hybris ridden in the Unreal Engine 5 host" caption="Unreal Engine 5" >}}

{{< figure src="filament.png" alt="Hybris ridden in the Filament host" caption="Google Filament. And yes, that is a window and not Chrome, because of course Filament also compiles as a native desktop build without any web in it." >}}

{{< figure src="gltf.png" alt="the same ride opened in Blender through the glTF export" caption="And the glTF exporter, which is a host as well, it just writes into a file instead of into the GPU." >}}

## What an engine element looks like

At the bottom of the tree are the engine elements. One header, free of any engine, declares the
props and the tag:

```cpp
struct CameraProps {
  float field_of_view = 90;
  bool active = false;
  Vec3 position{0, 0, 0};
  bool operator==(const CameraProps&) const = default;
};

inline const Element<CameraProps> Camera{"Camera"};
```

A camera, three props, nothing else. Every host writes one function for it, Filament, Unreal
Engine 5 and the [glTF exporter]({{< ref "/coaster-lab/glb-export" >}}):

```cpp
object.camera_entity = utils::EntityManager::get().create();
transforms.create(object.camera_entity);
object.camera = engine.createCamera(object.camera_entity);
```

```cpp
object.camera_component = NewObject<UCameraComponent>(object.component->GetOwner());
object.camera_component->SetupAttachment(object.component);
object.camera_component->SetFieldOfView(next.field_of_view);
```

```cpp
object.transform = glm::translate(Mat4(1.0), next.position) * convert::forward_frame();
object.component = model::Camera{.name = "camera"};
```

Three hosts, one element. The scene can now build components around it without knowing anything
about any host. A component that puts a camera somewhere and turns it a little every frame:

```cpp
inline const FunctionComponent OrbitCamera = [](const OrbitCameraProps& props) -> VNode {
  ReferenceObject& camera_node = use_ref(ReferenceObject{});
  Host* host = use_host();
  Number& angle = use_ref<Number>(0);

  hooks::use_frame([host, &camera_node, &angle](Number delta_seconds) {
    angle += delta_seconds * 0.5;
    set_node_transform(*host, camera_node.current(), glm::rotate(Mat4(1.0), angle, Vec3(0, 1, 0)));
  });

  return Camera({
      .field_of_view = 70,
      .active = true,
      .position = props.position,
      .ref = camera_node,
  });
};
```

Hooks, refs, a callback per frame. Where that camera ends up, as a Filament entity, as an Unreal
Engine 5 component or as a node in a glTF file, is not the job of this component.
