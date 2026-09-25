# RadioCard manual qualification

Status: not performed for the native RadioCard owner.

1. Name the group with Label and each item with Title and Description. With a
   screen reader, verify one radio announcement per item, the group name, and
   separate supporting description. Addon must not inflate the accessible name.
2. Tab into the selected or first enabled input. Verify arrow navigation,
   Home/End, disabled skipping, horizontal RTL and vertical orientation.
3. Activate the label, text and native input. Verify exactly one selection
   notification and one successful form value.
4. Verify readOnly allows focus and submission but no selection changes.
   Verify disabled inputs cannot activate and do not submit.
5. Verify required validation focuses the eligible input, uncontrolled reset
   restores its default, and external form association submits correctly.
6. Verify custom passive artwork, omitted Indicator, dynamic options, and
   controller/provider composition keep one input and one selection owner.
7. Repeat pointer and keyboard checks in supported browsers. Physical touch,
   real browser zoom and assistive technology checks require separate records;
   emulation does not substitute for those checks.
