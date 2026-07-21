export const guides = [
  {
    slug: "measure-for-furniture-delivery",
    title: "How to measure for furniture delivery",
    shortTitle: "Measure for delivery",
    description:
      "A practical checklist for measuring rooms, doors, corridors, stairs, and lifts before enquiring about furniture delivery in Mumbai.",
    intro:
      "The product dimensions are only one part of furniture planning. The item also needs a clear path from the building entrance to its final position. Measure the full route before confirming a sofa, bed, dining table, wardrobe, or cabinet.",
    sections: [
      {
        heading: "Measure the intended space",
        paragraphs: [
          "Record the usable width, depth, and height of the area where the furniture will sit. Include skirting, window ledges, plug points, doors, and other fixed features that reduce the practical space.",
          "Mark the proposed footprint on the floor with removable tape. This makes it easier to judge circulation space and how doors or drawers will open.",
        ],
      },
      {
        heading: "Check every access point",
        paragraphs: [
          "Measure the clear opening of the building entrance, home entrance, and each internal doorway. Use the narrowest usable measurement after accounting for handles, frames, gates, and doors that do not open fully.",
          "For corridors and turns, note both width and ceiling height. A long sofa or tabletop may need extra turning room even when its width fits through the doorway.",
        ],
      },
      {
        heading: "Measure stairs and lifts",
        paragraphs: [
          "For stairs, measure the narrowest width, landing depth, ceiling clearance, and any handrails or light fittings. Photograph tight corners so the access route is easier to assess.",
          "For a lift, record the door opening, internal width, internal depth, and internal height. Confirm whether the building has delivery timing or service-lift rules.",
        ],
      },
      {
        heading: "What to share with your enquiry",
        bullets: [
          "The product name or page link",
          "Room dimensions and the planned position",
          "The narrowest door, corridor, stair, and lift measurements",
          "Clear photos of corners or access restrictions",
          "Your Mumbai delivery locality and building access notes",
        ],
      },
    ],
    relatedCollections: ["sofas", "beds", "dining-sets", "wardrobes"],
  },
  {
    slug: "sofa-size-guide-small-living-rooms",
    title: "Sofa size guide for compact living rooms",
    shortTitle: "Compact sofa size guide",
    description:
      "Plan sofa width, depth, seating, circulation, and access for a compact Mumbai living room before choosing a model.",
    intro:
      "A sofa should fit the room, the access route, and the way the household uses the space. In a compact living room, a slightly smaller footprint can leave more useful circulation space than the largest model that technically fits.",
    sections: [
      {
        heading: "Start with the room layout",
        paragraphs: [
          "Measure the wall or zone available for the sofa, then note nearby doors, windows, balconies, TV units, and dining areas. Keep the main walking route clear rather than using every available centimetre for seating.",
          "Use tape on the floor to compare possible sofa footprints. Check the layout from the entrance and from the main seated viewing position.",
        ],
      },
      {
        heading: "Choose seating capacity deliberately",
        bullets: [
          "A two-seater can suit a narrow room or pair with movable chairs.",
          "A compact three-seater provides more shared seating without necessarily needing a deep footprint.",
          "An L-shaped sofa can use a corner efficiently, but the chaise side and access path must be measured carefully.",
          "Separate seats are easier to rearrange and may be simpler to move through tight access routes.",
        ],
      },
      {
        heading: "Compare depth as well as width",
        paragraphs: [
          "Two sofas with the same seating capacity can use very different floor areas. Compare overall depth, arm width, back angle, and seat depth rather than relying only on the number of seats.",
          "If the room also contains a centre table, leave enough space to walk around it and to sit down comfortably. A slimmer arm or raised-leg design can make a compact room feel more open.",
        ],
      },
      {
        heading: "Final checks before enquiring",
        bullets: [
          "Overall width, depth, and height",
          "Seat height and seat depth",
          "Doorway, corridor, stair, and lift access",
          "Fabric or finish suitable for everyday use",
          "Current price, availability, and delivery details",
        ],
      },
    ],
    relatedCollections: ["sofas", "recliners", "centre-tables"],
  },
];

export function findGuide(slug) {
  return guides.find((guide) => guide.slug === slug);
}

export function guidePath(guide) {
  return `/guides/${guide.slug}`;
}
