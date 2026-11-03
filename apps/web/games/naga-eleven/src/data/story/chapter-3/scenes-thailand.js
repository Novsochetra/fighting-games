import { narrate, say, scene } from '../script.js';

export const THAILAND_SCENES = {
  'ch3-hotel-night': scene('hotel-night', 'hope', [
    narrate({
      en: "That night, Sochetra can't sleep. Up on the hotel roof, someone is already there.",
      km: 'យប់នោះ សុចិត្រាគេងមិនលក់។ នៅលើដំបូលសណ្ឋាគារ មានម្នាក់នៅទីនោះរួចហើយ។',
    }),
    say('rithy', 'neutral', 'right', { en: "Can't sleep either?", km: 'គេងមិនលក់ដែរឬ?' }),
    say('rithy', 'sad', 'right', {
      en: "After that final, when we were eleven, my father didn't speak to me for a week.",
      km: 'ក្រោយវគ្គផ្ដាច់ព្រ័ត្រនោះ ពេលយើងអាយុដប់មួយឆ្នាំ ឪពុកខ្ញុំមិននិយាយជាមួយខ្ញុំមួយសប្ដាហ៍។',
    }),
    say('rithy', 'sad', 'right', {
      en: 'In my house, losing is shame. So I made sure nobody ever saw me need help.',
      km: 'នៅផ្ទះខ្ញុំ ការចាញ់គឺជាការអាម៉ាស់។ ដូច្នេះខ្ញុំមិនដែលឲ្យនរណាឃើញថាខ្ញុំត្រូវការជំនួយ។',
    }),
    say('sochetra', 'neutral', 'left', {
      en: "In my house, losing means extra noodles and one of Ta Sok's long stories.",
      km: 'នៅផ្ទះខ្ញុំ ការចាញ់មានន័យថាបាននំបញ្ចុកថែម និងរឿងវែងៗរបស់លោកតាសុខ។',
    }),
    say('rithy', 'happy', 'right', {
      en: "Ha! ...I think I'd like your house.",
      km: 'ហាហា! ...ខ្ញុំគិតថាខ្ញុំចូលចិត្តផ្ទះឯង។',
    }),
    say('sochetra', 'happy', 'left', {
      en: "Come for Khmer New Year. Mae will feed you until you can't run.",
      km: 'មកលេងពេលចូលឆ្នាំខ្មែរ។ ម៉ែខ្ញុំនឹងឲ្យឯងញ៉ាំរហូតរត់លែងរួច។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Next match, pass me the ball.',
      km: 'ការប្រកួតក្រោយ ហុចបាល់មកខ្ញុំផង។',
    }),
    say('rithy', 'smirk', 'right', {
      en: 'Only if you pass it back.',
      km: 'លុះត្រាតែឯងហុចវាត្រឡប់មកខ្ញុំវិញ។',
    }),
    narrate({
      en: 'Below them, the city lights run all the way to the sea. Two rivals laugh together.',
      km: 'នៅខាងក្រោម ភ្លើងទីក្រុងលាតសន្ធឹងដល់សមុទ្រ។ គូប្រជែងពីរនាក់សើចជាមួយគ្នា។',
    }),
  ]),

  'ch3-thailand-before': scene('stadium-tunnel', 'hope', [
    narrate({
      en: 'Group match two. Thailand: our neighbours, and our oldest football rivals.',
      km: 'ការប្រកួតពូលទីពីរ។ ថៃ៖ អ្នកជិតខាងរបស់យើង និងគូប្រជែងបាល់ទាត់យូរលង់ជាងគេ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'They are quick, and they never stop pressing. Respect them, and beat them.',
      km: 'គេលឿន ហើយមិនដែលឈប់សង្កត់។ គោរពគេ ហើយយកឈ្នះគេ។',
    }),
    say('dara', 'happy', 'right', {
      en: "Their keeper waved at me in the tunnel. I waved back. Now we're friends. Until kickoff.",
      km: 'អ្នកចាំទីគេគ្រវីដៃមកខ្ញុំនៅផ្លូវចូលទីលាន។ ខ្ញុំគ្រវីវិញ។ ឥឡូវយើងជាមិត្ត។ រហូតដល់ចាប់ផ្ដើមប្រកួត។',
    }),
    say('rithy', 'smirk', 'right', {
      en: "Sochetra. Left side. I'll find you.",
      km: 'សុចិត្រា។ ខាងឆ្វេង។ ខ្ញុំនឹងរកឯង។',
    }),
  ]),

  'ch3-thailand-win': scene('stadium-tunnel', 'hope', [
    say('announcer', 'happy', 'right', {
      en: 'Cambodia win! Did you see it? Rithy to Sochetra, Sochetra to Rithy!',
      km: 'កម្ពុជាឈ្នះ! ឃើញទេ? រិទ្ធីហុចឲ្យសុចិត្រា សុចិត្រាហុចឲ្យរិទ្ធី!',
    }),
    say('rithy', 'smirk', 'right', {
      en: "I passed it. You're welcome.",
      km: 'ខ្ញុំហុចហើយ។ មិនបាច់អរគុណទេ។',
    }),
    say('sochetra', 'smirk', 'left', {
      en: "I passed it back. You're welcome too.",
      km: 'ខ្ញុំហុចត្រឡប់វិញ។ ឯងក៏មិនបាច់អរគុណដែរ។',
    }),
    narrate({
      en: 'After the whistle, the two teams shake hands. Neighbours, rivals and friends.',
      km: 'ក្រោយកញ្ចែ ក្រុមទាំងពីរចាប់ដៃគ្នា។ អ្នកជិតខាង គូប្រជែង និងមិត្តភក្ដិ។',
    }),
  ]),

  'ch3-thailand-lose': scene('dressing-room', 'sad', [
    say('coach-bora', 'neutral', 'right', {
      en: 'Thailand deserved it. Now everything rests on Korea.',
      km: 'ថៃសមនឹងឈ្នះ។ ឥឡូវអ្វីៗទាំងអស់អាស្រ័យលើការប្រកួតជាមួយកូរ៉េ។',
    }),
    say('rithy', 'determined', 'right', {
      en: 'Then we beat Korea. Simple.',
      km: 'អញ្ចឹង យើងឈ្នះកូរ៉េ។ ងាយៗ។',
    }),
    say('dara', 'sad', 'right', {
      en: "Nothing about Korea is simple. Have you seen Minjun's legs?",
      km: 'គ្មានអ្វីងាយទេជាមួយកូរ៉េ។ ឯងឃើញជើងមីនជុនទេ?',
    }),
  ]),

  'ch3-thailand-draw': scene('stadium-tunnel', 'calm', [
    say('coach-bora', 'neutral', 'right', {
      en: 'A point. We stay alive. Korea decides it.',
      km: 'មួយពិន្ទុ។ យើងនៅមានឱកាស។ កូរ៉េជាអ្នកកំណត់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Then we give everything against Korea.',
      km: 'អញ្ចឹង យើងលះបង់អ្វីៗទាំងអស់ពេលជួបកូរ៉េ។',
    }),
  ]),
};
