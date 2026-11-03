import { narrate, say, scene, villager } from '../script.js';

export const SEMI_SCENES = {
  'ch1-semi-before': scene('training-ground', 'tense', [
    narrate({
      en: 'Twelve children, one teacher and a borrowed remork ride an hour to the provincial ground.',
      km: 'ក្មេងដប់ពីរនាក់ គ្រូម្នាក់ និងរ៉ឺម៉កខ្ចីគេមួយ ធ្វើដំណើរមួយម៉ោងទៅដល់ទីលានខេត្ត។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'A grandstand! With a roof! People sitting on chairs!',
      km: 'មានកន្លែងអង្គុយមើល! មានដំបូលទៀត! មនុស្សអង្គុយលើកៅអី!',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Riverside School has won this semi-final three years in a row.',
      km: 'សាលាមាត់ទន្លេ ឈ្នះវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនេះ បីឆ្នាំជាប់គ្នា។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: "Then they have something to lose. We don't. Play free.",
      km: 'អញ្ចឹងគេមានអ្វីត្រូវបាត់បង់។ យើងគ្មានទេ។ លេងឲ្យស្រួលខ្លួន។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Each of you has a skill now. Play well and your spirit fills.',
      km: 'ឥឡូវក្មួយៗម្នាក់ៗមានជំនាញរៀងខ្លួន។ លេងឲ្យល្អ ស្មារតីនឹងពេញ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'Vuthy, hold PASS to full: the Apsara Curl bends round them.',
      km: 'វុទ្ធី សង្កត់ PASS ឲ្យពេញ៖ កោងអប្សរាបត់វាងពួកគេ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'Pisey, Tola, from the wings: the Kite Cross.',
      km: 'ពិសី តុលា ពីស្លាបទាំងពីរ៖ បាល់ខ្លែង។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Srey Pov, Kosal: Elephant Guard. Stand in front, and nothing passes.',
      km: 'ស្រីពៅ កុសល៖ របាំងដំរី។ ឈរនៅខាងមុខ ហើយគ្មានអ្វីឆ្លងកាត់បានទេ។',
    }),
    say('dara', 'happy', 'right', {
      en: 'And me? I have... the Belly Block!',
      km: 'ចុះខ្ញុំវិញ? ខ្ញុំមាន... បាំងពោះ!',
    }),
    say('neary', 'happy', 'right', {
      en: 'I packed num banh chok for everyone. Win, and you can have seconds.',
      km: 'ម៉ែខ្ចប់នំបញ្ចុកមកឲ្យគ្រប់គ្នា។ បើឈ្នះ បានញ៉ាំថែមមួយចានទៀត។',
    }),
  ]),

  'ch1-semi-skill': scene('black', 'hope', [
    say('announcer', 'shocked', 'right', {
      en: "What was that? Chrey's children have skills!",
      km: 'នោះជាអ្វី? ក្មេងៗជ្រៃមានជំនាញផង!',
    }),
  ]),

  'ch1-semi-conceded': scene('black', 'sad', [
    say('dara', 'sad', 'right', {
      en: 'Sorry! Sorry! I blinked!',
      km: 'សុំទោស! សុំទោស! ខ្ញុំព្រិចភ្នែក!',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'One goal is nothing. Look up and find your friends!',
      km: 'មួយគ្រាប់មិនអីទេ។ ងើបមុខ ហើយរកមិត្តឯង!',
    }),
  ]),

  'ch1-semi-win': scene('training-ground', 'triumph', [
    narrate({
      en: 'Chrey School, from a village with bamboo goals, is going to the final in Phnom Penh.',
      km: 'សាលាជ្រៃ ពីភូមិដែលមានទីធ្វើពីឫស្សី នឹងទៅប្រកួតវគ្គផ្ដាច់ព្រ័ត្រនៅភ្នំពេញ។',
    }),
    say('coach-vannak', 'cry', 'right', {
      en: "I'm not crying. The wind from the river is strong today.",
      km: 'គ្រូមិនយំទេ។ ថ្ងៃនេះខ្យល់ទន្លេខ្លាំង។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Phnom Penh! Traffic lights! Here we come!',
      km: 'ភ្នំពេញ! ភ្លើងស្តុប! យើងមកហើយ!',
    }),
    villager(
      {
        name: { en: 'Riverside coach', km: 'គ្រូបង្វឹកសាលាមាត់ទន្លេ' },
        age: 'adult',
        mood: 'neutral',
      },
      {
        en: 'In the final you meet Royal Kids. They say their number ten has never lost.',
        km: 'នៅវគ្គផ្ដាច់ព្រ័ត្រ ក្មួយនឹងជួបក្រុមកុមាររាជធានី។ គេថាលេខដប់របស់គេមិនដែលចាញ់ទេ។',
      },
    ),
    say('sochetra', 'determined', 'left', {
      en: "Then he hasn't played Chrey yet.",
      km: 'អញ្ចឹង គេមិនទាន់ជួបជ្រៃទេ។',
    }),
  ]),

  'ch1-semi-lose': scene('training-ground', 'sad', [
    say('sochetra', 'cry', 'left', {
      en: 'It is over. We came all this way for nothing.',
      km: 'ចប់ហើយ។ យើងមកឆ្ងាយប៉ុណ្ណេះ ឥតបានការសោះ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: "Wipe your eyes. A Naga doesn't stay down. We train, and we play them again.",
      km: 'ជូតទឹកភ្នែកទៅ។ នាគមិនដេកដួលយូរទេ។ យើងហ្វឹកហាត់ ហើយលេងជាមួយគេម្ដងទៀត។',
    }),
    say('dara', 'sad', 'right', {
      en: "Next time I'll catch everything. Even the wind.",
      km: 'លើកក្រោយ ខ្ញុំនឹងចាប់បានទាំងអស់។ សូម្បីតែខ្យល់។',
    }),
  ]),

  'ch1-city': scene('city-street', 'tense', [
    narrate({
      en: 'Phnom Penh. Motorbikes like rivers, buildings like mountains, and noise everywhere.',
      km: 'ភ្នំពេញ។ ម៉ូតូដូចទឹកទន្លេ អគារដូចភ្នំ ហើយសំឡេងអ៊ូអរគ្រប់ទីកន្លែង។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'Sochetra, that light turned red and everyone STOPPED. It is magic.',
      km: 'សុចិត្រា ភ្លើងនោះឡើងក្រហម ហើយគ្រប់គ្នាឈប់។ អស្ចារ្យមែន។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'Look, the farm kids made it. Did you ride your buffalo all the way here?',
      km: 'មើលហ្ន៎ ក្មេងស្រែមកដល់ហើយ។ ជិះក្របីមកដល់នេះឬ?',
    }),
    say('sochetra', 'angry', 'left', {
      en: 'We came on a remork. Who are you?',
      km: 'យើងជិះរ៉ឺម៉កមក។ ចុះឯងជានរណា?',
    }),
    say('rithy', 'smirk', 'right', {
      en: "Rithy. Number ten, Royal Kids. Remember it. You'll be telling your village about me.",
      km: 'រិទ្ធី។ លេខដប់ ក្រុមកុមាររាជធានី។ ចាំឲ្យច្បាស់ ឯងនឹងទៅនិទានប្រាប់អ្នកភូមិឯងពីខ្ញុំ។',
    }),
    say('rithy', 'neutral', 'right', {
      en: "In Phnom Penh, we don't play for fun. We play to win.",
      km: 'នៅភ្នំពេញ យើងមិនលេងដើម្បីសប្បាយទេ។ យើងលេងដើម្បីឈ្នះ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "In Chrey, we play for each other. You'll see what that's worth.",
      km: 'នៅជ្រៃ យើងលេងដើម្បីគ្នាទៅវិញទៅមក។ ឯងនឹងឃើញថាវាមានតម្លៃប៉ុណ្ណា។',
    }),
    say('dara', 'smirk', 'right', {
      en: 'Also, our buffalo is very fast. Just so you know.',
      km: 'ម្យ៉ាងទៀត ក្របីយើងរត់លឿនណាស់។ ប្រាប់ឲ្យដឹង។',
    }),
  ]),
};
