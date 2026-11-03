import { narrate, say, scene, villager } from '../script.js';

const NEIGHBOUR = { name: { en: 'Neighbour', km: 'អ្នកជិតខាង' }, age: 'adult' };

export const NIGERIA_SCENES = {
  'ch4-letters': scene('hotel-night', 'hope', [
    narrate({
      en: "That night, a parcel arrives from Chrey School. Coach Vannak's handwriting is on the box.",
      km: 'យប់នោះ កញ្ចប់មួយមកពីសាលាជ្រៃ។ មានអក្សរដៃរបស់លោកគ្រូវណ្ណៈនៅលើប្រអប់។',
    }),
    narrate({
      en: 'Inside: forty drawings. A boy with a number ten, a Naga, and a lot of very big trophies.',
      km: 'នៅខាងក្នុង៖ គំនូរសែសិបសន្លឹក។ ក្មេងប្រុសពាក់លេខដប់ នាគមួយ និងពានរង្វាន់ធំៗជាច្រើន។',
    }),
    say('sochetra', 'cry', 'left', {
      en: '"Big brother Sochetra, I want to be like you." "Please win. I will practise every day."',
      km: '«បងសុចិត្រា ខ្ញុំចង់ធ្វើដូចបង។» «សូមឈ្នះណា ខ្ញុំនឹងហ្វឹកហាត់រាល់ថ្ងៃ។»',
    }),
    say('dara', 'happy', 'right', {
      en: 'This one says, "Dara is the best keeper in the world." I\'m framing it.',
      km: 'សន្លឹកនេះសរសេរថា «ដារ៉ាជាអ្នកចាំទីល្អបំផុតលើលោក»។ ខ្ញុំនឹងដាក់ស៊ុមវា។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'There\'s one for me too. "Big brother Rithy, please pass to Sochetra." Even the kids know.',
      km: 'មានមួយសម្រាប់ខ្ញុំដែរ។ «បងរិទ្ធី សូមហុចឲ្យបងសុចិត្រា»។ សូម្បីក្មេងក៏ដឹង។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Whatever the world thinks of us, we carry forty dreams. That makes us big enough.',
      km: 'ទោះពិភពលោកគិតយ៉ាងណាពីយើង យើងកំពុងយកក្ដីស្រមៃសែសិបទៅជាមួយ។ ប៉ុណ្ណឹងធ្វើឲ្យយើងធំគ្រប់គ្រាន់ហើយ។',
    }),
    say('dara', 'happy', 'right', {
      en: 'The Chrey kids wrote to us: "Score a Chrey goal!"',
      km: 'ក្មេងៗជ្រៃសរសេរមកយើង៖ «ស៊ុតគ្រាប់បាល់បែបជ្រៃមួយមក!»',
    }),
    say('dara', 'smirk', 'right', {
      en: 'Remember our game by the paddies? My long throw, your volley.',
      km: 'ចាំការលេងរបស់យើងក្បែរវាលស្រែទេ? ខ្ញុំបោះបាល់ឆ្ងាយ ឯងទាត់វាលើអាកាស។',
    }),
    say('sochetra', 'determined', 'left', { en: 'Chrey Lightning!', km: 'រន្ទះជ្រៃ!' }),
    narrate({
      en: 'Chrey Lightning: when Dara throws it to you, SHOOT as it comes.',
      km: 'រន្ទះជ្រៃ៖ ពេលដារ៉ាបោះបាល់មករកអ្នក ចុច SHOOT ពេលបាល់មកដល់។',
    }),
  ]),

  'ch4-nigeria-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Group match two. Nigeria: powerful, fast, and full of fearless young stars.',
      km: 'ការប្រកួតពូលទីពីរ។ នីហ្សេរីយ៉ា៖ ខ្លាំង លឿន និងពោរពេញដោយតារាវ័យក្មេងដែលមិនខ្លាចអ្វីសោះ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "They'll win every race. So don't race. Keep the ball and make them chase.",
      km: 'គេនឹងឈ្នះរាល់ការប្រណាំងរត់។ អញ្ចឹងកុំប្រណាំង។ រក្សាបាល់ ហើយឲ្យគេដេញ។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'Finally, a plan that suits my legs.',
      km: 'ទីបំផុត ផែនការដែលស័ក្តិសមនឹងជើងខ្ញុំ។',
    }),
  ]),

  'ch4-nigeria-lightning': scene('village-tv', 'triumph', [
    villager(NEIGHBOUR, {
      en: "That's our Dara! That's our Sochetra!",
      km: 'នោះដារ៉ារបស់យើង! នោះសុចិត្រារបស់យើង!',
    }),
  ]),

  'ch4-nigeria-win': scene('stadium-tunnel', 'hope', [
    say('announcer', 'happy', 'right', {
      en: 'Cambodia win! The smallest team in the tournament keeps growing!',
      km: 'កម្ពុជាឈ្នះ! ក្រុមតូចជាងគេក្នុងការប្រកួតនេះ នៅតែបន្តធំឡើង!',
    }),
    narrate({
      en: 'Nigeria\'s captain swaps shirts with Sochetra. "Next time, my friend," he grins.',
      km: 'ប្រធានក្រុមនីហ្សេរីយ៉ាដូរអាវជាមួយសុចិត្រា។ គេញញឹមថា៖ «លើកក្រោយ មិត្តសម្លាញ់»។',
    }),
  ]),

  'ch4-nigeria-lose': scene('dressing-room', 'sad', [
    say('coach-bora', 'neutral', 'right', {
      en: 'Nigeria were stronger today. One match left. Mexico.',
      km: 'ថ្ងៃនេះនីហ្សេរីយ៉ាខ្លាំងជាង។ នៅសល់មួយប្រកួតទៀត។ ម៉ិកស៊ិក។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Then Mexico is our final before the final.',
      km: 'អញ្ចឹង ម៉ិកស៊ិកជាវគ្គផ្ដាច់ព្រ័ត្ររបស់យើង មុនវគ្គផ្ដាច់ព្រ័ត្រ។',
    }),
  ]),

  'ch4-nigeria-draw': scene('stadium-tunnel', 'calm', [
    say('coach-bora', 'neutral', 'right', {
      en: "A point. It's all on Mexico now.",
      km: 'មួយពិន្ទុ។ ឥឡូវអ្វីៗទាំងអស់អាស្រ័យលើម៉ិកស៊ិក។',
    }),
    say('dara', 'happy', 'right', {
      en: 'I saved a header with my face. My face would like a day off.',
      km: 'ខ្ញុំរាំងបាល់ក្បាលដោយមុខខ្ញុំ។ មុខខ្ញុំចង់សម្រាកមួយថ្ងៃ។',
    }),
  ]),
};
