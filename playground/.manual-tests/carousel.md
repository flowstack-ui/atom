# Carousel Manual Test Protocol (Draft)

This protocol remains a draft until the complete sequence is run in a real
browser and reviewed. Automated Playwright evidence does not mark these steps
as manually passed.

## Step 0: Workbench Smoke Check

1. Open the Atom playground and choose `Navigation` > `Carousel`.
2. Confirm the page order is Anatomy, Canvas, then Inspector.
3. Confirm Canvas shows three full-width slides, Previous, Play, Next, and
   three picker controls.
4. Confirm Source contains Root, Viewport, Track, three Slides, navigation,
   RotationControl, Picker, and PickerItems.

Pass condition: the scenario is reachable and every public part has visible or
inspectable evidence.

## Step 1: Manual Selection

1. Activate Next and confirm Managed hosting becomes the only active Slide.
2. Activate Previous and confirm Company services becomes active.
3. Activate the Swifty products picker and confirm its Slide becomes active
   without moving focus.
4. Disable Loop and verify Previous disables on the first Slide and Next
   disables on the last Slide.
5. Hide Picker Dots and then Previous / Next; confirm each optional control
   group is omitted without breaking the required slide structure.

Pass condition: button and picker selection, boundaries, loop, and optional
controls match the public state and accessibility attributes.

## Step 2: Automatic Rotation

1. Enable Automatic Rotation and confirm Root and Viewport expose `playing`,
   Viewport uses `aria-live="off"`, and the control action is Stop.
2. Hover the carousel and confirm it becomes temporarily `paused`.
3. Move the pointer away and confirm rotation resumes.
4. Focus any control and confirm rotation becomes `stopped`, Viewport becomes
   `aria-live="polite"`, and it does not restart by itself.
5. Activate RotationControl and confirm rotation starts only by that explicit
   request.

Pass condition: timed rotation is always stoppable and its focus, hover, and
live-region policies remain visible and truthful.

## Step 3: Native Scroll, Touch, and Direction

1. On desktop, horizontally scroll the Viewport until the second Slide settles
   nearest the leading edge; confirm that Slide becomes active.
2. Switch to RTL and repeat Previous, Next, picker, and native scrolling.
3. On a named touch device, swipe one Slide horizontally and confirm the
   nearest settled Slide becomes active while vertical page scrolling remains
   usable.
4. With reduced motion enabled, confirm selection remains correct without
   requiring smooth animation from the styled layer.

Pass condition: physical scrolling selects the settled Slide in LTR and RTL,
and the styled layer's motion policy does not alter Atom behavior.

## Step 4: Semantics and Focus Safety

1. Inspect Root for a concise label and `aria-roledescription="carousel"`.
2. Inspect every Slide for a unique label and
   `aria-roledescription="slide"`.
3. Confirm inactive Slides expose `aria-hidden="true"` and `inert`, and their
   links or controls cannot receive keyboard focus.
4. Confirm the active PickerItem exposes `aria-disabled="true"` and every
   picker controls its matching Slide id.
5. Tab through all visible controls and confirm native button focus order and
   labels are understandable without slide position alone.

Pass condition: inactive content cannot leak into navigation or accessibility
output, and all optional controls remain clearly named.
