import { narrate, say, scene } from '../script.js';

export const SEMI_SCENES = {
  'ch4-focus-before': scene('training-ground', 'calm', [
    say('coach-bora', 'neutral', 'right', {
      en: 'Germany make no mistakes. And nobody has dribbled past Lukas in two years.',
      km: 'អាល្លឺម៉ង់មិនធ្វើកំហុសទេ។ ហើយពីរឆ្នាំមកហើយ គ្មាននរណានាំបាល់កាត់លូកាសបានទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "So we don't hurry. We breathe, we wait, and we strike once.",
      km: 'អញ្ចឹងយើងមិនប្រញាប់ទេ។ យើងដកដង្ហើម រង់ចាំ ហើយវាយប្រហារម្ដង។',
    }),
  ]),

  'ch4-focus-after': scene('training-ground', 'hope', [
    say('sochetra', 'neutral', 'left', {
      en: "The river is quiet. I'm ready.",
      km: 'ទន្លេស្ងប់ហើយ។ ខ្ញុំរួចរាល់ហើយ។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'You and your river. ...Is there room in it for me?',
      km: 'ឯង និងទន្លេរបស់ឯង។ ...មានកន្លែងសម្រាប់ខ្ញុំទេ?',
    }),
    say('sochetra', 'happy', 'left', {
      en: "There's always been room.",
      km: 'តែងតែមានកន្លែងជានិច្ច។',
    }),
  ]),

  'ch4-semi-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The semi-final. Germany, and their iron defender: Lukas.',
      km: 'វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រ។ អាល្លឺម៉ង់ និងខ្សែការពារដែករបស់គេ៖ លូកាស។',
    }),
    say('lukas', 'neutral', 'right', {
      en: 'I do not hate you. I simply do not let you through.',
      km: 'ខ្ញុំមិនស្អប់អ្នកទេ។ ខ្ញុំគ្រាន់តែមិនឲ្យអ្នកឆ្លងកាត់។',
    }),
    say('lukas', 'determined', 'right', {
      en: 'Nobody passes the Iron Gate. Nobody.',
      km: 'គ្មាននរណាឆ្លងកាត់ទ្វារដែកបានទេ។ គ្មាននរណាម្នាក់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Gates are made for opening.',
      km: 'ទ្វារមានសម្រាប់បើក។',
    }),
    say('dara', 'smirk', 'right', {
      en: 'Ooh. He practised that line in the mirror.',
      km: 'អូ។ គេហាត់និយាយប្រយោគនោះនៅមុខកញ្ចក់។',
    }),
  ]),

  'ch4-semi-duel': scene('black', 'tense', [
    say('lukas', 'determined', 'right', { en: 'Iron Gate. Closed.', km: 'ទ្វារដែក។ បិទ។' }),
    say('sochetra', 'determined', 'left', {
      en: "Then I'll jump it, like Hanuman!",
      km: 'អញ្ចឹង ខ្ញុំលោតរំលងវា ដូចហនុមាន!',
    }),
  ]),

  'ch4-semi-win': scene('stadium-tunnel', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: 'Cambodia are in the final of the World Championship! Is this a dream?!',
      km: 'កម្ពុជាឡើងដល់វគ្គផ្ដាច់ព្រ័ត្រ ជើងឯកពិភពលោក! តើនេះជាសុបិនឬ?!',
    }),
    say('lukas', 'neutral', 'right', {
      en: "The gate opened. I don't know how. Show the world how, in the final.",
      km: 'ទ្វារបានបើក។ ខ្ញុំមិនដឹងថាម៉េចទេ។ បង្ហាញពិភពលោកនៅវគ្គផ្ដាច់ព្រ័ត្រ។',
    }),
    narrate({
      en: 'In the other semi-final, Brazil won. Rafael is dancing again.',
      km: 'នៅវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រមួយទៀត ប្រេស៊ីលឈ្នះ។ រ៉ាហ្វាអែលកំពុងរាំម្ដងទៀត។',
    }),
  ]),

  'ch4-semi-lose': scene('dressing-room', 'sad', [
    say('lukas', 'neutral', 'right', {
      en: 'The gate holds. Come back stronger.',
      km: 'ទ្វារនៅតែរឹងមាំ។ ត្រឡប់មកវិញឲ្យខ្លាំងជាងនេះ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'We train, and we play this semi-final again. Our story does not end here.',
      km: 'យើងហ្វឹកហាត់ ហើយលេងវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។ រឿងរបស់យើងមិនបញ្ចប់នៅទីនេះទេ។',
    }),
  ]),

  'ch4-final-eve': scene('hotel-night', 'calm', [
    narrate({
      en: 'The night before the final. One last call home.',
      km: 'យប់មុនវគ្គផ្ដាច់ព្រ័ត្រ។ ទូរស័ព្ទចុងក្រោយទៅផ្ទះ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Grandchild. On the bridges of Angkor, the Naga has seven heads. Do you know why?',
      km: 'ចៅ។ នៅលើស្ពានអង្គរ នាគមានក្បាលប្រាំពីរ។ ចៅដឹងទេ ហេតុអ្វី?',
    }),
    say('sochetra', 'neutral', 'left', { en: 'No, Ta. Tell me.', km: 'អត់ទេ លោកតា។ ប្រាប់ចៅមក។' }),
    say('ta-sok', 'happy', 'right', {
      en: 'This is what I think. One head looks one way. Seven heads see everyone who walks with you.',
      km: 'តាប្រាប់តាមគំនិតតា។ ក្បាលមួយមើលឃើញតែទិសមួយ។ ក្បាលប្រាំពីរមើលឃើញគ្រប់គ្នាដែលដើរជាមួយចៅ។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "Tomorrow, don't play with one head. Play with all of them.",
      km: 'ថ្ងៃស្អែក កុំលេងដោយក្បាលតែមួយ។ លេងដោយក្បាលទាំងអស់។',
    }),
    say('neary', 'cry', 'right', {
      en: 'And come home safe. Win or lose, there will be noodles.',
      km: 'ហើយត្រឡប់មកផ្ទះវិញដោយសុវត្ថិភាព។ ឈ្នះក៏ដោយ ចាញ់ក៏ដោយ នំបញ្ចុកនៅតែមាន។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'We will win, Mae. There will be noodles AND a trophy.',
      km: 'យើងនឹងឈ្នះ ម៉ែ។ នឹងមានទាំងនំបញ្ចុក ទាំងពានរង្វាន់។',
    }),
  ]),
};
