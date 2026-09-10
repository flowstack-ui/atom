# TableOfContents manual protocol

Status: not run. Automated browser results are recorded by the owner test suite.

1. Open Navigation → Table of Contents and activate first, intermediate and final links with keyboard and pointer.
2. Scroll the bounded article through long gaps and the final short section. Exactly one location should remain current.
3. Navigate twice rapidly, then interrupt smooth scrolling with wheel, touch or a scroll key.
4. Toggle the final target off and on; verify discovery, focus and current-state recovery.
5. Refuse controlled updates and verify the accepted current location does not silently change.
6. Exercise native document mode, modifier clicks, browser back/forward and initial fragments.
7. Scroll the rail independently. Article navigation must not move unrelated ancestors or steal passive focus.
8. Test reduced motion, missing observers, repeated mount/unmount and dynamic layout refresh.
9. With a screen reader, verify named navigation, list hierarchy, current location and target focus. No live announcements on passive scrolling.
10. Test real browser zoom and physical touch devices. Record environment and result before marking covered.
