import { narrate, say, scene } from '../script.js';

export const ENDING_SCENES = {
  'ch3-final-win': scene('trophy-stage', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: 'Cambodia are the champions of Asia! For the first time in history!',
      km: 'កម្ពុជាជាជើងឯកអាស៊ី! ជាលើកដំបូងក្នុងប្រវត្តិសាស្ត្រ!',
    }),
    say('haruto', 'happy', 'right', {
      en: 'Your angles were all wrong. And they were beautiful. Congratulations.',
      km: 'មុំរបស់អ្នកខុសទាំងអស់។ ហើយវាស្អាតណាស់។ សូមអបអរសាទរ។',
    }),
    say('rithy', 'neutral', 'right', {
      en: 'Sochetra. Eight years ago you held out your hand. I never took it.',
      km: 'សុចិត្រា។ ប្រាំបីឆ្នាំមុន ឯងលូកដៃមក។ ខ្ញុំមិនដែលចាប់វាទេ។',
    }),
    say('rithy', 'happy', 'right', { en: "I'm taking it now.", km: 'ឥឡូវខ្ញុំចាប់វាហើយ។' }),
    narrate({
      en: 'In pagodas and markets all over Cambodia, people stand up and cheer.',
      km: 'នៅតាមវត្ត និងផ្សារទូទាំងប្រទេសកម្ពុជា ប្រជាជនក្រោកឈរ ហើយស្រែកអបអរ។',
    }),
    say('dara', 'cry', 'right', {
      en: "I'm not crying. Nobody on this team cries. It's the floodlights.",
      km: 'ខ្ញុំមិនយំទេ។ គ្មាននរណាក្នុងក្រុមនេះយំទេ។ គឺភ្លើងកីឡដ្ឋាន។',
    }),
  ]),

  'ch3-final-lose': scene('dressing-room', 'sad', [
    say('haruto', 'neutral', 'right', {
      en: 'You were almost one team today. Come back, and finish the sentence.',
      km: 'ថ្ងៃនេះអ្នកស្ទើរតែជាក្រុមតែមួយហើយ។ ត្រឡប់មកវិញ ហើយបញ្ចប់ប្រយោគនោះ។',
    }),
    say('rithy', 'determined', 'right', {
      en: 'Again, Coach. We play it again.',
      km: 'ម្ដងទៀត លោកគ្រូ។ យើងលេងវាម្ដងទៀត។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'We train, and we play this final again. Together.',
      km: 'យើងហ្វឹកហាត់ ហើយលេងវគ្គផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។ ជាមួយគ្នា។',
    }),
  ]),

  'ch3-ending': scene('airport', 'triumph', [
    narrate({
      en: 'Phnom Penh airport. Flags, drums, and more people than the team has ever seen.',
      km: 'អាកាសយានដ្ឋានភ្នំពេញ។ ទង់ជាតិ ស្គរ និងមនុស្សច្រើនជាងអ្វីដែលក្រុមធ្លាប់ឃើញ។',
    }),
    say('neary', 'cry', 'right', {
      en: 'My son! And my other son!',
      km: 'កូនម៉ែ! ហើយកូនម៉ែម្នាក់ទៀត!',
    }),
    say('rithy', 'shocked', 'right', {
      en: 'Me? ...Thank you, Aunt Neary.',
      km: 'ខ្ញុំ? ...អរគុណ អ្នកមីង។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Asia was the beginning. One day, the world.',
      km: 'អាស៊ីគ្រាន់តែជាការចាប់ផ្ដើម។ ថ្ងៃណាមួយ ពិភពលោក។',
    }),
    narrate({
      en: 'Five more years would pass before that day came.',
      km: 'ប្រាំឆ្នាំទៀត ទើបថ្ងៃនោះមកដល់។',
    }),
  ]),
};
