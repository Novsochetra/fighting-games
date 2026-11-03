export const VENUE_NAMES = Object.freeze({
  'village-field': { en: 'Chrey Village Field', km: 'ទីលានភូមិជ្រៃ' },
  'provincial-ground': { en: 'Provincial Ground', km: 'ទីលានខេត្ត' },
  'city-school-stadium': { en: 'City School Stadium', km: 'ពហុកីឡដ្ឋានសាលាក្រុង' },
  'national-stadium': { en: 'National Stadium', km: 'ពហុកីឡដ្ឋានជាតិ' },
  'asia-stadium': { en: 'Asian Championship Stadium', km: 'ពហុកីឡដ្ឋានជើងឯកអាស៊ី' },
  'world-stadium': { en: 'World Championship Stadium', km: 'ពហុកីឡដ្ឋានជើងឯកពិភពលោក' },
});

// a venue is named by its id, or by a text of its own
export const venueName = (venue) =>
  typeof venue === 'string' ? (VENUE_NAMES[venue] ?? venue) : (venue ?? null);
