import { narrate, say, scene } from '../script.js';

export const SQUAD_SCENES = {
  'ch3-intro': scene('federation-office', 'hope', [
    narrate({
      en: 'Phnom Penh. The national youth team meets for the first time.',
      km: 'ភ្នំពេញ។ ក្រុមជម្រើសជាតិយុវជនជួបជុំគ្នាជាលើកដំបូង។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'In two months, the Asian Youth Championship. Nobody expects anything from us.',
      km: 'ពីរខែទៀត ការប្រកួតជើងឯកយុវជនអាស៊ី។ គ្មាននរណារំពឹងអ្វីពីយើងទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Good. Let's surprise them.",
      km: 'ល្អ។ តោះធ្វើឲ្យគេភ្ញាក់ផ្អើល។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'Coach. The number ten. Who gets it?',
      km: 'លោកគ្រូ។ លេខដប់ អ្នកណាបាន?',
    }),
    say('coach-bora', 'neutral', 'right', { en: 'Sochetra.', km: 'សុចិត្រា។' }),
    say('rithy', 'angry', 'right', {
      en: 'Him? Because he beat me twice?',
      km: 'គេ? ព្រោះគេឈ្នះខ្ញុំពីរដងឬ?',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "Yes. You're seven. Make it famous.",
      km: 'បាទ។ ឯងលេខប្រាំពីរ។ ធ្វើឲ្យវាល្បីទៅ។',
    }),
    say('dara', 'happy', 'right', {
      en: "I'm number one. Nobody argued. I love this team.",
      km: 'ខ្ញុំលេខមួយ។ គ្មាននរណាប្រកែកទេ។ ខ្ញុំស្រឡាញ់ក្រុមនេះណាស់។',
    }),
  ]),

  'ch3-tension': scene('training-ground', 'tense', [
    narrate({
      en: 'Two weeks of training. Rithy and Sochetra have not passed to each other once.',
      km: 'ពីរសប្ដាហ៍នៃការហ្វឹកហាត់។ រិទ្ធី និងសុចិត្រាមិនដែលហុចបាល់ឲ្យគ្នាសូម្បីតែម្ដង។',
    }),
    say('coach-bora', 'angry', 'right', {
      en: 'Stop! Rithy, Sochetra was wide open. A blind buffalo could have seen him.',
      km: 'ឈប់! រិទ្ធី សុចិត្រាទំនេរស្រឡះ។ សូម្បីក្របីខ្វាក់ក៏មើលឃើញគេដែរ។',
    }),
    say('rithy', 'angry', 'right', {
      en: 'He would have missed anyway.',
      km: 'គេនឹងទាត់ខុសដដែល។',
    }),
    say('sochetra', 'angry', 'left', {
      en: 'Says the one who shot from forty metres. Again.',
      km: 'និយាយដោយអ្នកដែលស៊ុតពីចម្ងាយសែសិបម៉ែត្រ។ ម្ដងទៀតហើយ។',
    }),
    say('dara', 'sad', 'right', {
      en: 'You two are like a cat and a dog in one rice sack.',
      km: 'ពួកឯងទាំងពីរ ដូចឆ្មា និងឆ្កែនៅក្នុងបាវអង្ករតែមួយ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Japan, Korea, Iran: they play as one body. We have two heads fighting over one tail.',
      km: 'ជប៉ុន កូរ៉េ អ៊ីរ៉ង់ លេងដូចរាងកាយតែមួយ។ យើងមានក្បាលពីរ ឈ្លោះគ្នាដណ្ដើមកន្ទុយមួយ។',
    }),
  ]),

  'ch3-pass-before': scene('training-ground', 'tense', [
    say('coach-bora', 'determined', 'right', {
      en: 'New drill. Rithy passes, Sochetra shoots. Hit every target, or you both run.',
      km: 'លំហាត់ថ្មី។ រិទ្ធីហុច សុចិត្រាស៊ុត។ ត្រូវគោលដៅទាំងអស់ បើមិនអញ្ចឹងទេ ទាំងពីរនាក់រត់។',
    }),
    say('rithy', 'smirk', 'right', {
      en: "Then I'll pass perfectly. If he misses, that's on him.",
      km: 'អញ្ចឹងខ្ញុំហុចឲ្យល្អឥតខ្ចោះ។ បើគេទាត់ខុស នោះជាកំហុសគេ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'A duo needs two gauges and two hearts. Rithy, stay near him.',
      km: 'ក្បាច់គូត្រូវការស្មារតីពីរ និងបេះដូងពីរ។ រិទ្ធី នៅឲ្យជិតគេ។',
    }),
  ]),

  'ch3-pass-after': scene('training-ground', 'hope', [
    say('sochetra', 'neutral', 'left', {
      en: '...That last pass. It was perfect.',
      km: '...បាល់ហុចចុងក្រោយនោះ។ ល្អឥតខ្ចោះ។',
    }),
    say('rithy', 'neutral', 'right', {
      en: "I said it would be. And you didn't miss.",
      km: 'ខ្ញុំបាននិយាយហើយ។ ហើយឯងក៏មិនទាត់ខុសដែរ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Was that so hard? Pack your bags. We fly on Monday.',
      km: 'ពិបាកណាស់ឬ? រៀបចំកាបូបទៅ។ យើងហោះហើរថ្ងៃច័ន្ទ។',
    }),
  ]),

  'ch3-airport': scene('airport', 'hope', [
    say('neary', 'cry', 'right', {
      en: 'Did you pack the krama? The num banh chok for the plane? Your toothbrush?',
      km: 'កូនខ្ចប់ក្រមាហើយឬនៅ? នំបញ្ចុកសម្រាប់ញ៉ាំលើយន្តហោះ? ច្រាសដុសធ្មេញ?',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Yes, Mae. Yes. And yes.',
      km: 'បាទ ម៉ែ។ បាទ។ ហើយបាទ។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Take Cambodia with you, grandchild. Not just your bag.',
      km: 'យកកម្ពុជាទៅជាមួយផង ចៅ។ មិនមែនតែកាបូបទេ។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'Sochetra. Planes are very heavy. How do they stay up? Nobody will tell me.',
      km: 'សុចិត្រា។ យន្តហោះធ្ងន់ណាស់។ ម៉េចក៏វាហោះបាន? គ្មាននរណាប្រាប់ខ្ញុំសោះ។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'Faith, Dara. Like your goalkeeping.',
      km: 'ជំនឿ ដារ៉ា។ ដូចការចាំទីរបស់ឯងហ្នឹង។',
    }),
    narrate({
      en: "Rithy bows to Neary with his palms joined. She pats his cheek as if he's her own.",
      km: 'រិទ្ធីលើកដៃសំពះអ្នកមីងនារី។ គាត់ប៉ះថ្ពាល់រិទ្ធី ដូចជាកូនរបស់គាត់ផ្ទាល់។',
    }),
  ]),
};
