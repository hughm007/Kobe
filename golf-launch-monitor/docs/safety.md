# Safety

**Document date:** 2026-10-01.

> **These are general precautions, not certified safety engineering.**
> - They do not replace the instructions of the manufacturers of your impact screen, net,
>   enclosure, cameras, illuminators, projector, mounts or electrical equipment.
> - They do not replace local building and electrical codes.
> - Where this document and a manufacturer's instructions disagree, follow the manufacturer.
> - If in doubt, ask a qualified professional.
>
> **The software cannot see your room.** It does not detect an unsafe setup, a damaged screen,
> a person in the swing arc, or a misaimed illuminator. The in-app safety checklist records that
> you read these precautions; it does not verify anything.

The project's current state is described in [product-requirements.md](product-requirements.md):
no sensor hardware exists yet (Phase 1). The hardware sections below apply as soon as you set up
a hitting bay, and they will apply to the Phase 2 camera system.

## 1. Before every session

- [ ] Screen or net is **rated by its manufacturer for real golf balls at full swing speed**, and
      was inspected today (§2).
- [ ] Overhead and lateral swing clearance was measured for the tallest player and the longest
      club, and nothing has moved since (§4).
- [ ] The **shank zone** holds no people, pets, cameras, lights, computers or fragile objects (§5).
- [ ] Cameras, lights and mounts are secure and outside the swing arc and likely ball paths (§6).
- [ ] No cables, mat edges or loose balls in the stance area or walkways (§7).
- [ ] Illuminators are aimed at the hitting zone, not at eye level, and used within the
      manufacturer's limits (§8).
- [ ] Lighting does not shine into the golfer's eyes (§9).
- [ ] Children and pets are out of the bay; spectators are in the safe area (§10).

## 2. Impact screen and net

- **Never hit real balls into an unrated surface.** Projector screens, bedsheets, tarps, foam
  boards, drywall, garage doors and windows are not ball stoppers. If the manufacturer does not
  state a rating for full-swing real-ball impacts, treat the product as unrated.
- **Install it as the manufacturer specifies.** That covers frame assembly, tension, the stand-off
  gap to the wall behind it, and any side or ceiling netting the manufacturer specifies. A screen
  hung too close to a wall can transmit impacts or send balls back hard.
- **Inspect before each session.** Look and feel for:
  - holes, thin or shiny worn spots in the impact area;
  - frayed edges;
  - torn grommets, perished bungees or ties;
  - loose frame joints and sagging.

  Stop if you find damage, and repair or replace as the manufacturer directs.
- **Protect the edges.** Shots that hit the frame, a seam or the gap at the edge of the screen
  rebound unpredictably. Fill gaps with the manufacturer's side and top netting.

## 3. Ball rebound

- **Balls come back.** They rebound off the screen and also off the frame, walls, ceiling and
  floor. Thin and topped shots can skip off the mat and floor first.
- **Test the setup with soft shots first.** Before any full swing in a new or changed setup, hit
  short, slow shots and watch where the balls go.
- **Keep the area behind the screen clear.** The screen moves when hit.
- **Collect loose balls.** A ball on the floor is a slip hazard for a golfer mid-swing.

## 4. Swing clearance

A club strike on a ceiling, light, beam or wall can break the club, injure the golfer, or send
debris into the room. Measure clearance **slowly**; never "test" it with a full-speed swing.

### Overhead

1. Put the hitting mat (and any platform) in its final position. Mats and platforms raise the
   golfer.
2. The **tallest** player takes their **longest club** (usually the driver) to the address
   position.
3. **Conservative check.** Holding the club straight up at full arm extension gives roughly the
   highest point a club can reach. If the ceiling and everything on it clear that, a normal swing
   clears too.
4. **Slow rehearsal.** Otherwise, swing in slow motion to the top of the backswing and to the
   finish while a spotter watches the club head. Hold the highest position and measure from the
   floor to the club head with a tape measure.
5. Add a margin. Fast swings and mis-hits travel beyond slow rehearsals. Write down the measured
   heights.
6. Check every overhead obstacle along the arc: lights, garage-door rails and openers, beams,
   pipes, sprinklers, and any overhead-mounted camera or projector (§6).

If a club does not clear, do not hit that club in this bay.

### Lateral

1. Mark the ball position on the mat with tape.
2. With the tallest player and the longest club, rehearse the full swing slowly. A spotter marks
   on the floor the farthest club-head positions:
   - backswing and follow-through, along the target line;
   - behind the golfer's back and past the ball, across the target line.
3. Measure from those marks to the nearest walls, posts, shelves, vehicles and hardware.
4. **Left- and right-handed players stand on opposite sides of the ball.** If both use the bay,
   measure both setups.

The software does not know your room dimensions and cannot warn you about clearance.

## 5. Shank zone and stray shots

**What it is.** A shank (a strike on the hosel) can leave the club fast, often low, and at a wide
angle to the target line, sometimes nearly sideways. It goes toward the side of the ball **opposite the
golfer**:

| Golfer | Shank direction | World frame ([coordinate-system.md](coordinate-system.md)) |
|---|---|---|
| Right-handed | To the right of the target line, forward of the ball | −Y side, +X |
| Left-handed | To the left of the target line, forward of the ball | +Y side, +X |

**Treat the whole region as a strike zone.** That is the area on the far side of the ball from
the golfer, from the ball position forward, from floor level to above head height. Toe strikes,
thin shots and tops also leave at unexpected angles. If both left- and right-handed players use
the bay, **both sides are shank zones**.

**Keep out of the shank zone:**
- people and pets;
- cameras and illuminators;
- the computer and monitors;
- floor-standing projectors;
- glass, windows and vehicles.

**A camera that must view from the shank side** (for example a face-on view) must sit outside the
ball's possible path, or behind a barrier or netting that its manufacturer rates for ball
impacts. Phase 2 camera positions will be documented with the camera system and must respect
this zone.

## 6. Cameras, lights and other hardware

- **Mount rigidly.** Use ceiling or wall mounts rated for the device's weight. Add a secondary
  safety tether for anything mounted overhead.
- **No tripods inside the swing arc or stance area.** Tripods outside it are trip hazards:
  weight or secure them.
- **Rigid mounting is also a measurement requirement.** A camera that moves after calibration
  makes the calibration invalid. The sensor-health contract includes `camera-movement` and
  `calibration-validity` metrics for the Phase 2 system.
- **Overhead hardware** must be outside the overhead swing arc you measured (§4) and protected
  from rebounds (§3).
- **Protect lenses that face the screen** from rebounds, using the shields or housings the
  manufacturer offers.
- **Projectors.** Mount as the manufacturer directs, out of the swing arc and the ball path.
  Place the projector so the golfer at address does not look into the lens.
- **Heat.** Some lights and illuminators get hot. Keep them away from netting, foam and other
  flammable material, as their manufacturers specify.

## 7. Cables, power and trip hazards

- **Route cables away from people.** No cable crosses the stance area or a walkway. Run cables
  along walls or the ceiling, or use floor cable covers rated for foot traffic.
- **Keep the floor clear.** Keep the hitting mat flat with its edges secured (curled edges trip).
  Clear loose balls and club covers.
- **Relieve strain** on cables that run to wall- or ceiling-mounted devices, so a snag cannot
  pull a device down.
- **Power.** Use outlets, power strips and extension cords rated for the load, and do not
  daisy-chain power strips. Use residual-current (ground-fault) protection where your local code
  requires it. Garages are often damp and dusty: keep power supplies off the floor and away from
  water.

## 8. Infrared illuminators and eye safety

High-speed cameras often use infrared (IR) illumination. Phase 2 has not chosen hardware yet;
these precautions apply to any illuminator you add.

- **IR is invisible.** It does not look bright, so your eyes do not blink or look away
  protectively. Do not rely on comfort to judge exposure.
- **Use only illuminators whose manufacturer states an eye-safety classification and exposure
  limits.** For LED and lamp sources this is commonly an IEC 62471 risk group; laser sources
  carry an IEC 60825-1 class. Follow the stated minimum distances and exposure limits.
- **Aim at the hitting zone** (ball and floor), never at head height. Never look into an
  illuminator at close range.
- **Do not modify optics or drivers,** and do not run illuminators above their rated current.
- **Switch illuminators off** when you are not capturing.
- **Alignment lasers.** The calibration contract allows a `laser` method for target-line setup.
  Use only a laser whose class and instructions permit that use, and never aim it at eye level.

This software does not control or monitor any illuminator.

## 9. Lighting, glare and flicker

- **Glare.** Lights must not shine into the golfer's eyes at address or in the follow-through.
  Avoid bright sources in the sight line toward the ball and the screen.
- **Flicker affects measurement.** Lights powered from AC mains can flicker at twice the mains
  frequency (100 Hz on 50 Hz grids, 120 Hz on 60 Hz grids). Short-exposure high-speed cameras
  record that as brightness changes between frames, which degrades detection. The camera health
  contract includes a `lighting-flicker` metric for Phase 2. Prefer flicker-free lighting.
- **Visible strobes affect people.** Visible flashing light can be uncomfortable and can trigger
  seizures in people with photosensitive epilepsy. If a future hardware option uses visible
  strobes, warn everyone present. Prefer continuous or non-visible (IR) illumination.

## 10. Children, pets and spectators

- **One golfer at a time.** Nobody else is in the hitting area while someone holds a club. The
  golfer looks around before every swing.
- **Spectators stand behind the golfer's back, outside the marked swing arc.** Never across from
  the golfer (the shank side, §5), never in front of the ball, and not directly behind the ball on
  the target line, where the backswing and screen rebounds travel.
- **Children** need active supervision. They move quickly and walk into swing arcs. When the bay
  is unattended, store clubs and balls away, and switch off and secure the equipment.
- **Pets** stay out of the garage during sessions.
- **Doors.** Keep the garage door closed, or its controls out of reach, so nobody walks into the
  bay mid-swing. Park vehicles outside or protect them.

## 11. Data and privacy

| Topic | What the software does |
|---|---|
| Where data lives | **On this computer only.** The packages make no network calls. The desktop UI is specified to make no network calls and to use no analytics. Browser data is kept in IndexedDB in your browser profile. The Node backend writes JSON files to a directory you choose. |
| What is stored | Player name and handedness; sessions (with their labels); shot records (launch values, results, warnings, versions). The desktop UI is specified to keep its settings in browser local storage. |
| Diagnostic capture consent | **Off by default.** Only when you turn it on are raw sensor observations (ball positions, triggers, spin observations, health reports) stored inside each shot record. When it is off, `rawObservations` is `null`. |
| Camera images (Phase 2) | No camera frames exist yet. When they do, they will be retained only with diagnostic consent. Frames can show people and the room. Ask everyone who may be in view, and a guardian for children, before enabling capture. |
| Delete controls | Repository functions (TESTED; the UI controls are in progress): delete a shot; delete a session (and all its shots); delete a player, with or without their shots; clear all data. A player's name lives only in the player record (unless you typed it into a session label): deleting the player removes the name, and kept shots retain only an opaque id. |
| Encryption | **None at rest.** Anyone with access to this computer account or browser profile can read the data. Use operating-system account protection or disk encryption if that matters to you. |
| Exports | CSV and JSON exports are separate plain files. JSON exports include raw observations when they were retained. Deleting data in the app does not delete exports; check an export before sharing it. |
| Browser storage | Clearing the browser's site data deletes all locally stored shots. There is no backup or sync; export to keep a copy. |

## 12. Product limits

- **Use it for practice and casual simulation only.**
- **Not for betting** or wagering of any kind.
- **Not for certified or sanctioned competition,** handicap submission, or equipment conformance
  testing.
- **Not for safety-critical decisions,** including judging whether a hitting bay is safe.
- **No accuracy is claimed.** No metric is VERIFIED against real measurements, and Phase 1 data
  is synthetic, replayed, manual or estimated. See [limitations.md](limitations.md).
