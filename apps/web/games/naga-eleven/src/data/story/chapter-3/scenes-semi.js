import { narrate, say, scene } from '../script.js';

export const SEMI_SCENES = {
  'ch3-night-before': scene('training-ground', 'calm', [
    narrate({
      en: 'The semi-final is two days away. That night, the team trains under the floodlights.',
      km: 'នៅសល់ពីរថ្ងៃទៀតដល់វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រ។ យប់នោះ ក្រុមហ្វឹកហាត់ក្រោមភ្លើងកីឡដ្ឋាន។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "Iran's keeper, Farhad, is the tallest in Asia. Power won't beat him.",
      km: 'អ្នកចាំទីអ៊ីរ៉ង់ ហ្វារហាដ ខ្ពស់ជាងគេនៅអាស៊ី។ កម្លាំងមិនអាចយកឈ្នះគេបានទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'A calm head will. Clear your mind, wait for the moment, then strike.',
      km: 'ចិត្តស្ងប់ទើបឈ្នះ។ ធ្វើឲ្យចិត្តស្រឡះ រង់ចាំពេលវេលា រួចទាត់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Breathe like the river.',
      km: 'ដកដង្ហើមដូចទន្លេ។',
    }),
  ]),

  'ch3-night-after': scene('training-ground', 'hope', [
    say('rithy', 'neutral', 'right', {
      en: "When you breathe like that, I can tell where you're going to run.",
      km: 'ពេលឯងដកដង្ហើមបែបនោះ ខ្ញុំដឹងថាឯងនឹងរត់ទៅណា។',
    }),
    say('sochetra', 'happy', 'left', {
      en: "And I can tell where you'll pass. Strange, huh?",
      km: 'ហើយខ្ញុំដឹងថាឯងនឹងហុចទៅណា។ ចម្លែកមែនទេ?',
    }),
    say('dara', 'smirk', 'right', {
      en: "Not strange. It's called being a team. I've been saying it for eight years.",
      km: 'មិនចម្លែកទេ។ គេហៅថាក្រុម។ ខ្ញុំនិយាយរឿងនេះប្រាំបីឆ្នាំហើយ។',
    }),
  ]),

  'ch3-semi-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The semi-final. Iran, and the giant in their goal.',
      km: 'វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រ។ អ៊ីរ៉ង់ និងយក្សនៅក្នុងទីរបស់គេ។',
    }),
    say('farhad', 'neutral', 'right', {
      en: 'My grandfather kept sheep in the Zagros mountains. He taught me to stop wolves.',
      km: 'ជីតាខ្ញុំឃ្វាលចៀមនៅលើភ្នំហ្សាក្រូស។ គាត់បង្រៀនខ្ញុំឲ្យទប់ស្កាត់ចចក។',
    }),
    say('farhad', 'determined', 'right', {
      en: 'Nothing gets past the mountain.',
      km: 'គ្មានអ្វីអាចឆ្លងកាត់ភ្នំបានទេ។',
    }),
    say('sochetra', 'neutral', 'left', {
      en: 'My grandfather kept goal too. He taught me that rivers go around mountains.',
      km: 'ជីតាខ្ញុំក៏ធ្លាប់ចាំទីដែរ។ គាត់បង្រៀនខ្ញុំថា ទន្លេហូរជុំវិញភ្នំ។',
    }),
    say('farhad', 'smirk', 'right', {
      en: 'Ha. Then let us see who is older, the river or the mountain.',
      km: 'ហាហា។ អញ្ចឹងតោះមើលថា អ្នកណាចាស់ជាង ទន្លេ ឬភ្នំ។',
    }),
  ]),

  'ch3-semi-duel': scene('black', 'tense', [
    say('farhad', 'determined', 'right', {
      en: 'Shoot. I want to feel it in my hands.',
      km: 'ស៊ុតមក។ ខ្ញុំចង់ស្គាល់វានៅក្នុងដៃខ្ញុំ។',
    }),
    say('sochetra', 'determined', 'left', { en: 'Then hold on tight!', km: 'អញ្ចឹងចាប់ឲ្យជាប់!' }),
  ]),

  'ch3-semi-win': scene('stadium-tunnel', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: 'Cambodia are in the final of the Asian Youth Championship! For the first time ever!',
      km: 'កម្ពុជាឡើងដល់វគ្គផ្ដាច់ព្រ័ត្រ ជើងឯកយុវជនអាស៊ី! ជាលើកដំបូងក្នុងប្រវត្តិសាស្ត្រ!',
    }),
    say('farhad', 'happy', 'right', {
      en: 'The river wins today. Good. Go, and flow right past Japan.',
      km: 'ថ្ងៃនេះទន្លេឈ្នះ។ ល្អ។ ទៅ ហើយហូរកាត់ជប៉ុនផង។',
    }),
    narrate({
      en: 'Japan won the other semi-final. Haruto is waiting.',
      km: 'ជប៉ុនឈ្នះវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រមួយទៀត។ ហារូតូកំពុងរង់ចាំ។',
    }),
  ]),

  'ch3-semi-lose': scene('dressing-room', 'sad', [
    say('farhad', 'neutral', 'right', {
      en: 'The mountain stands. Come back when the river is stronger.',
      km: 'ភ្នំនៅតែឈរ។ ត្រឡប់មកវិញ ពេលទន្លេខ្លាំងជាងនេះ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'We will. We train tonight, and we play this semi-final again.',
      km: 'យើងនឹងមក។ យើងហ្វឹកហាត់យប់នេះ ហើយលេងវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។',
    }),
  ]),

  'ch3-final-eve': scene('hotel-night', 'calm', [
    narrate({
      en: 'The night before the final, a call from Chrey. The whole family shouts into one phone.',
      km: 'យប់មុនវគ្គផ្ដាច់ព្រ័ត្រ មានទូរស័ព្ទពីជ្រៃ។ គ្រួសារទាំងមូលស្រែកចូលទូរស័ព្ទតែមួយ។',
    }),
    say('neary', 'happy', 'right', {
      en: 'Are you eating? You sound thin. Can a voice sound thin? Yours does.',
      km: 'កូនញ៉ាំបាយទេ? សំឡេងកូនស្គម។ សំឡេងអាចស្គមបានទេ? សំឡេងកូនស្គមមែន។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Grandchild. Is Rithy there? Let him listen too.',
      km: 'ចៅ។ រិទ្ធីនៅទីនោះទេ? ឲ្យគេស្ដាប់ដែរ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'At the gates of Angkor Thom, gods and demons hold the same Naga, and pull together.',
      km: 'នៅខ្លោងទ្វារអង្គរធំ ទេវតា និងអសុរកាន់នាគតែមួយ ហើយទាញជាមួយគ្នា។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "Enemies, pulling one serpent, churned the ocean of milk. That's how the world got its nectar.",
      km: 'សត្រូវពីរពួក ទាញនាគតែមួយ កូរសមុទ្រទឹកដោះ។ ដូច្នេះហើយ ទើបពិភពលោកមានទឹកអម្រឹត។',
    }),
    say('rithy', 'neutral', 'right', {
      en: '...Grandfather. Are you saying we are the gods and the demons?',
      km: '...លោកតា។ លោកតាចង់និយាយថា យើងជាទេវតា និងអសុរឬ?',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "I'm saying one Naga can have two heads. Sleep well, boys.",
      km: 'តាចង់និយាយថា នាគមួយអាចមានក្បាលពីរ។ គេងឲ្យលក់ស្រួលណា ក្មួយៗ។',
    }),
    say('sochetra', 'happy', 'left', { en: 'Two heads...', km: 'ក្បាលពីរ...' }),
    say('rithy', 'smirk', 'right', {
      en: "Don't even think about it. ...Fine. Think about it.",
      km: 'កុំគិតឲ្យសោះ។ ...មិនអីទេ។ គិតទៅ។',
    }),
  ]),
};
