// Fixed lists, as in db/seed: the API returns only ids, and no endpoint changes these rows.

export interface Person {
  id: number;
  full_name: string;
}

export interface Category {
  id: number;
  label: string;
}

export interface Tag {
  id: number;
  label: string;
}

// A post holds only ids; these lists give the names and labels to show.
// Staff: the persons in staff.csv, the only ones who may write posts.
export const STAFF: Person[] = [
  { id: 1, full_name: 'Martha Lindley' },
  { id: 2, full_name: 'Dr. Iris Carter' },
  { id: 3, full_name: 'Nora Hall' },
  { id: 4, full_name: 'Rose Dalton' },
  { id: 5, full_name: 'Leah Bradley' },
  { id: 6, full_name: 'Daniel Brooks' },
  { id: 7, full_name: 'Peter Hayes' },
  { id: 8, full_name: 'Ellie Dean' },
  { id: 9, full_name: 'Andrew Fletcher' },
];

export const CATEGORIES: Category[] = [
  { id: 1, label: 'SavorTheMoment' },
  { id: 2, label: 'TasteCloser' },
  { id: 3, label: 'CoffeeStories' },
  { id: 4, label: 'BeanScience' },
  { id: 5, label: 'BeanBanter' },
  { id: 6, label: 'FlavourMemory' },
  { id: 7, label: 'FromTheCuppingTable' },
  { id: 8, label: 'FreshStart' },
];

export const TAGS: Tag[] = [
  { id: 1, label: 'Inspiring' },
  { id: 2, label: 'BrewItDifferently' },
  { id: 3, label: 'EverydayRitual' },
  { id: 4, label: 'Hospitality' },
  { id: 5, label: 'BetterTogether' },
  { id: 6, label: 'JustOneCup' },
  { id: 7, label: 'BloomAndBurr' },
  { id: 8, label: 'AgainstTheGrain' },
  { id: 9, label: 'RoastScience' },
  { id: 10, label: 'FlavourImagination' },
  { id: 11, label: 'WhoSetsTheRules' },
  { id: 12, label: 'SpecialityCoffee' },
  { id: 13, label: 'EspressoAndExtraction' },
  { id: 14, label: 'TasteTraining' },
  { id: 15, label: 'WhosTheExpert' },
  { id: 16, label: 'CoffeeMyths' },
  { id: 17, label: 'MeetTheRoaster' },
];
