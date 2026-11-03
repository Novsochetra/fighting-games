import { narrate, say, scene, villager } from '../script.js';

const NEIGHBOUR = { name: { en: 'Neighbour', km: 'អ្នកជិតខាង' }, age: 'adult' };

export const WORLD_SCENES = {
  'ch4-intro': scene('village-tv', 'hope', [
    narrate({
      en: 'Five years later. For the first time ever, Cambodia plays at the World Championship.',
      km: 'ប្រាំឆ្នាំក្រោយមក។ ជាលើកដំបូងបំផុត កម្ពុជាចូលរួមការប្រកួតជើងឯកពិភពលោក។',
    }),
    narrate({
      en: 'In Chrey, the whole village squeezes under one stilt house, around one TV.',
      km: 'នៅជ្រៃ អ្នកភូមិទាំងមូលអង្គុយណែនក្រោមផ្ទះឈើខ្ពស់មួយ ជុំវិញទូរទស្សន៍តែមួយ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Children, sit at the front! This is the boy I told you about. The one who learned from chickens!',
      km: 'កូនសិស្ស អង្គុយខាងមុខ! នេះហើយក្មេងដែលគ្រូនិទានប្រាប់។ អ្នកដែលរៀនពីមាន់!',
    }),
    say('neary', 'happy', 'right', {
      en: "I closed my stall early. First time in twenty years. Don't tell my customers.",
      km: 'ម៉ែបិទតូបមុនម៉ោង។ ជាលើកដំបូងក្នុងរយៈម្ភៃឆ្នាំ។ កុំប្រាប់ភ្ញៀវម៉ែណា។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "My eyes are old, but they'll see this. They have waited eighty years for it.",
      km: 'ភ្នែកតាចាស់ហើយ តែវានឹងមើលឃើញរឿងនេះ។ វារង់ចាំប៉ែតសិបឆ្នាំហើយ។',
    }),
    villager(NEIGHBOUR, {
      en: "Ta Sok, move your head a little! We can't see the screen!",
      km: 'តាសុខ ងាកក្បាលបន្តិចមក! មើលអេក្រង់មិនឃើញទេ!',
    }),
  ]),

  'ch4-arrival': scene('airport', 'hope', [
    narrate({
      en: 'Far from home, the World Championship. Cameras, lights, and one question.',
      km: 'ឆ្ងាយពីផ្ទះ ការប្រកួតជើងឯកពិភពលោក។ កាមេរ៉ា ពន្លឺ និងសំណួរមួយ។',
    }),
    villager(
      { name: { en: 'Reporter', km: 'អ្នកកាសែត' }, age: 'adult', sex: 'female', mood: 'neutral' },
      { en: 'Cambodia? Where is that, exactly?', km: 'កម្ពុជា? នៅឯណាពិតប្រាកដ?' },
    ),
    say('sochetra', 'smirk', 'left', {
      en: "Watch our games. By the end, you'll know.",
      km: 'មើលការប្រកួតរបស់យើង។ ដល់ចុងបញ្ចប់ អ្នកនឹងដឹង។',
    }),
    say('rithy', 'smirk', 'right', {
      en: "Write it down: Cambodia. You'll be writing it a lot.",
      km: 'កត់ទុក៖ កម្ពុជា។ អ្នកនឹងសរសេរវាច្រើនដង។',
    }),
    say('dara', 'happy', 'right', {
      en: "And I'm Dara. Goalkeeper. Very handsome. Please write that down too.",
      km: 'ហើយខ្ញុំឈ្មោះដារ៉ា។ អ្នកចាំទី។ សង្ហាណាស់។ សូមកត់នោះទុកផង។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Our group: Brazil, Nigeria and Mexico. Brazil first.',
      km: 'ពូលរបស់យើង៖ ប្រេស៊ីល នីហ្សេរីយ៉ា និងម៉ិកស៊ិក។ ប្រេស៊ីលមុនគេ។',
    }),
  ]),

  'ch4-cones-before': scene('training-ground', 'hope', [
    say('coach-bora', 'neutral', 'right', {
      en: 'At this level, a defender closes a gap in half a second. Your feet must think faster.',
      km: 'នៅកម្រិតនេះ ខ្សែការពារបិទចន្លោះក្នុងរយៈពេលកន្លះវិនាទី។ ជើងឯកត្រូវគិតឲ្យលឿនជាងនេះ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Cones again. Like the very first day in Chrey.',
      km: 'កោនម្ដងទៀត។ ដូចថ្ងៃដំបូងបង្អស់នៅជ្រៃ។',
    }),
  ]),

  'ch4-cones-after': scene('training-ground', 'hope', [
    say('coach-bora', 'happy', 'right', {
      en: 'Faster than the first day, I hope.',
      km: 'សង្ឃឹមថាលឿនជាងថ្ងៃដំបូង។',
    }),
    say('sochetra', 'happy', 'left', {
      en: "Much faster. Dara's mother's pots were scarier than these cones.",
      km: 'លឿនជាងច្រើន។ ឆ្នាំងម៉ែដារ៉ាគួរឲ្យខ្លាចជាងកោនទាំងនេះ។',
    }),
  ]),
};
