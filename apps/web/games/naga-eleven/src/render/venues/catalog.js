import { asiaStadium } from './asia-stadium/index.js';
import { citySchoolStadium } from './city-school-stadium/index.js';
import { nationalStadium } from './national-stadium/index.js';
import { provincialGround } from './provincial-ground/index.js';
import { villageField } from './village-field/index.js';
import { worldStadium } from './world-stadium/index.js';

export const VENUES = {
  'village-field': villageField,
  'provincial-ground': provincialGround,
  'city-school-stadium': citySchoolStadium,
  'national-stadium': nationalStadium,
  'asia-stadium': asiaStadium,
  'world-stadium': worldStadium,
};
