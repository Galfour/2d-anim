# TODO
- [X] basic skeleton
- [X] debug view
- [X] improve debug view
- [X] feet and hands
- [X] render with actual sprites
  - [X] Draw on Photoshop
  - [X] Decide on format
    - One layer / png for each limb, named `[limb]`
    - Each layer has a duplicate layer named `[limb] guide`, with red dot as starting point and blue dot as end point
  - [X] Export Multiple Layers Photoshop
  - [X] Post process photoshop export
    - `.png.png` :(
    - `_XXXX_` :(
    - remove dashes
    - make everything lowercase
  - [X] Crop the sprites to their bounding boxes
  - [X] Parse Photoshop
    - [X] Takes all files.png in folder
    - [X] Takes their guide
    - [X] Generate individual JSON of start/end pos, and start + len + absolute rotation
    - [X] Generate big JSON
  - [X] Reconcile .JSON and skeleton
  - [X] Render Skeleton with Sprites
  - [X] Order
  - [X] Write down instructions
  - [X] Debug
- [X] Check precisions and edge conditions
  - [X] names -> ok
  - [X] bounding-box -> ok
  - [X] rotate -> ok
  - [X] guides -> ~ok
    - can't do better for rotation normalisation, given size of images
- [ ] CSS renderer
- [ ] first animation
- [ ] easy to change size of limbs
- [ ] decide on ratio for real-life proportions
- [ ] support items
- [ ] re-do The Sprite
- [ ] add bone for hat/hair
- [ ] denormalise rotations and deal with it at render time

# Guides

## Create a Mesh
- Screenshot a skeleton debug mode render
- Go on Photoshop
  - Create one layer per limb, call it `[limb]`, draw them however you want
  - Duplicate each layer, call it `[limb] guide`. Draw a red dot on top of the starting point of the limb from the screenshot, and a blue dot on the end point.
  - Export as multiple png layers
- Post-process with the script
  1. run `npx tsx post-process-photoshop-export-names folder`
  2. run `npx tsx post-process-guide-rotate folder`
  3. run `npx tsx post-process-guide-bounding-boxes folder`
  4. run `npx tsx post-process-photoshop-guides folder`
  5. Use the `all-guides.json`