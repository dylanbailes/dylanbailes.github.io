# Portfolio interview review

Reviewed October 7, 2026. Repository refreshed from GitHub before work and again
before publication; the starting version was `dd2aaae` on `main`.

## Bioreactor source review

The user supplied the MAE 156B Team 22 Drive folder. Access was obtained through
the user's university account. The technical review covered the released report
and errata, final sponsor presentation and poster, individual component analyses,
progress and meeting notes, available Arduino/MATLAB code, CAD-file inventory,
test spreadsheets, project photographs, and the final narrated demonstration.
Purchasing-folder contents were inventoried; the final report supplies the stated
budget. Reimbursement forms and receipts were not published.

The latest explicit final report is **RELEASE V2**. Its original PDF, final poster,
and final presentation are hosted unchanged; SHA-256 comparisons against the
downloaded originals passed. The HTML reader retains its earlier supplied export
and clearly links to V2 as the authoritative release.

The case study adds ownership, requirements versus outcomes, lid tradeoffs, four
magnetic-generator iterations, geometry, both custom boards, working electronics,
embedded waveform timing, early electric simulation, field mapping, validation,
final UI, the final demonstration, and next steps. Image-level provenance is in
`public/assets/images/bioreactor/SOURCES.md`.

Important source distinctions preserved:

- Final report Table A1.1 credits Dylan Bailes with initial electric simulations,
  lid analysis, magnetic-generator CAD and versions 1–4, and final UI design/testing.
  Other subsystem work and team measurements are attributed to the team.
- Four well modules were delivered with one complete optical station.
- The Hall-sensor satellite was used in the final build; the main STM32 drive
  board needed revision. Final drive electronics used ESP32/perfboard assemblies.
- Available `FullModule.ino` provides open-loop waveform drive and Hall telemetry,
  with current monitoring removed. Calibration is described by the final demo;
  completed closed-loop field regulation is not claimed.
- The magnetic surface is the original published/interpolated figure. An unresolved
  raw-table unit label is documented. No new magnetic accuracy calculation is made.
- Ambiguous thermal wording is not converted into a precise absolute-temperature
  claim. Sustained culture operation, thermal protection, cross-well interaction,
  and repeatability remain further validation.
- The recreated voltage chart uses only four supplied expected/dry/wet points,
  with an accompanying CSV. No synthetic trials or error bars are introduced.
- Individual lid constraints are labeled targets, rather than verified endurance.

## Other projects

All six cards now show individual role and delivery status. Discipline filters
include every declared relevant category. UAS illustrations are visibly identified
as explanatory graphics without company measurements. Torque-control results remain
explicitly simulation results with hardware validation pending. RoboButler preserves
the incomplete automatic camera handoff. The MAE 3 report distinguishes the actual
2.3 kg robot mass from its theoretical 2.67 kg lifting capacity; the card now states
the tested 20-inch reach and explains why higher scoring heights were missed.

## Verification

- Production build and all 20 existing site tests pass, including local destinations,
  image dimensions, metadata, report diagrams/tables, themes, and QR destinations.
- Desktop and 390-pixel mobile views checked in light and dark themes. Mobile
  horizontal overflow corrected.
- Case presentation and project-gallery enlargement checked with arrow keys,
  Home/End, Escape, and focus restoration.
- Multidisciplinary filters checked by click and keyboard navigation.
- Local demo playback decoded successfully: 173.888 seconds, ready state 4, and
  playback time advanced. Video and PDFs load only on request.
- Existing fonts are served locally with OFL license files; mobile hero uses
  responsive WebP sizes. No original hardware photos were synthesized.
- Lighthouse mobile bioreactor: performance **96**, accessibility **100**, best
  practices **100**, SEO **100**. No run warnings.
- Lighthouse desktop home: performance **100**, accessibility **96**, best
  practices **100**, SEO **100**. The contrast flags concern existing decorative
  section-number watermarks, rather than the project text. No run warnings.

Public deployment verification is recorded after publication.
