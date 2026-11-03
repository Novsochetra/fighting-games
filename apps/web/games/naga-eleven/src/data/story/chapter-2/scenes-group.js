import { narrate, say, scene } from '../script.js';

export const GROUP_SCENES = {
  'ch2-siem-reap-before': scene('training-ground', 'hope', [
    narrate({
      en: 'The group: Kampong Cham, Siem Reap and Battambang. Two of the three go through.',
      km: 'ពូលនេះមាន កំពង់ចាម សៀមរាប និងបាត់ដំបង។ បីក្រុម យកពីរ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Eleven players and a big pitch. Use the wings, switch the play, make them run.',
      km: 'កីឡាករដប់មួយនាក់ និងទីលានធំ។ លេងតាមគែម ប្ដូរទិសលេង ធ្វើឲ្យគេរត់ហត់។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Siem Reap High. They say they train in front of Angkor Wat every morning.',
      km: 'វិទ្យាល័យសៀមរាប។ គេថាពួកគេហ្វឹកហាត់នៅមុខអង្គរវត្តរៀងរាល់ព្រឹក។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Then we show them our mornings on Phnom Srey.',
      km: 'អញ្ចឹង យើងបង្ហាញគេពីព្រឹកនៅភ្នំស្រីរបស់យើង។',
    }),
  ]),

  'ch2-siem-reap-kickoff': scene('black', 'hope', [
    say('coach-sokha', 'neutral', 'right', {
      en: "Eleven a side. Don't run into a crowd. Pass into space and let the ball do the work.",
      km: 'ម្ខាងដប់មួយនាក់។ កុំរត់ចូលហ្វូងគេ។ ហុចទៅកន្លែងទំនេរ ហើយឲ្យបាល់ធ្វើការ។',
    }),
  ]),

  'ch2-siem-reap-win': scene('training-ground', 'hope', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'Three points. You won because you passed. Remember that.',
      km: 'បីពិន្ទុ។ ឯងឈ្នះ ព្រោះឯងហុចបាល់។ ចាំទុក។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Was that a compliment? Coach, was that a compliment?',
      km: 'នោះជាការសរសើរឬ? លោកគ្រូ នោះសរសើរមែនទេ?',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Battambang next. Sleep early.',
      km: 'បន្ទាប់ បាត់ដំបង។ គេងឲ្យឆាប់។',
    }),
  ]),

  'ch2-siem-reap-lose': scene('training-ground', 'sad', [
    say('sochetra', 'sad', 'left', {
      en: 'I had the ball so many times. I wanted to score them all myself.',
      km: 'ខ្ញុំមានបាល់ច្រើនដងណាស់។ ខ្ញុំចង់ស៊ុតចូលទាំងអស់ដោយខ្លួនឯង។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'And how did that go?',
      km: 'ហើយវាទៅជាយ៉ាងម៉េចដែរ?',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: "The group isn't over. Beat Battambang, and we're still alive. Together, this time.",
      km: 'វគ្គចែកពូលមិនទាន់ចប់ទេ។ ឈ្នះបាត់ដំបង យើងនៅមានឱកាស។ លើកនេះ លេងជាមួយគ្នា។',
    }),
  ]),

  'ch2-siem-reap-draw': scene('training-ground', 'calm', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'One point. Not enough, but not nothing.',
      km: 'មួយពិន្ទុ។ មិនគ្រប់គ្រាន់ តែក៏មិនមែនគ្មានដែរ។',
    }),
    say('dara', 'happy', 'right', {
      en: 'One point is like half a bowl of noodles. Still dinner.',
      km: 'មួយពិន្ទុ ដូចនំបញ្ចុកកន្លះចាន។ នៅតែជាអាហារពេលល្ងាច។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Battambang next. Win, and we decide our own fate.',
      km: 'បន្ទាប់ បាត់ដំបង។ ឈ្នះ ហើយយើងកំណត់វាសនាខ្លួនឯង។',
    }),
  ]),

  'ch2-battambang-before': scene('training-ground', 'tense', [
    narrate({
      en: 'Battambang High. Strong, tough and loud. Their fans brought drums.',
      km: 'វិទ្យាល័យបាត់ដំបង។ ខ្លាំង រឹងប៉ឹង និងសំឡេងខ្លាំង។ អ្នកគាំទ្រគេយកស្គរមកជាមួយ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: "They'll kick you. Let them. Then pass around them.",
      km: 'គេនឹងទាត់ឯង។ ទុកឲ្យគេទាត់ទៅ។ ហើយហុចបាល់ជុំវិញគេ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Football is eleven, not one. I know, Coach.',
      km: 'បាល់ទាត់គឺដប់មួយនាក់ មិនមែនម្នាក់។ ខ្ញុំដឹងហើយ លោកគ្រូ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Knowing is easy. Show me.',
      km: 'ដឹងគឺងាយ។ បង្ហាញខ្ញុំមើល។',
    }),
  ]),

  'ch2-battambang-win': scene('training-ground', 'hope', [
    say('dara', 'happy', 'right', {
      en: 'Their drums went very quiet at the end.',
      km: 'ស្គររបស់គេស្ងាត់ឈឹងនៅចុងបញ្ចប់។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Good. Whatever the table says, today you played as a team.',
      km: 'ល្អ។ ទោះតារាងពិន្ទុថាយ៉ាងណា ថ្ងៃនេះឯងលេងជាក្រុម។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Coach... was that a compliment?',
      km: 'លោកគ្រូ... នោះជាការសរសើរមែនទេ?',
    }),
    say('coach-sokha', 'happy', 'right', { en: "Don't get used to it.", km: 'កុំទម្លាប់។' }),
  ]),

  'ch2-battambang-lose': scene('training-ground', 'sad', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'Now we wait for the other result. That is what happens when you leave it to others.',
      km: 'ឥឡូវយើងរង់ចាំលទ្ធផលក្រុមផ្សេង។ នេះហើយ ពេលយើងទុកវាសនាឲ្យអ្នកដទៃ។',
    }),
    say('dara', 'sad', 'right', {
      en: "My stomach hurts, and I'm not even hungry. That's how bad it is.",
      km: 'ខ្ញុំឈឺពោះ ហើយមិនឃ្លានផង។ អាក្រក់ដល់ថ្នាក់ហ្នឹង។',
    }),
  ]),

  'ch2-battambang-draw': scene('training-ground', 'calm', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'A draw. Now the table decides.',
      km: 'ស្មើ។ ឥឡូវតារាងពិន្ទុជាអ្នកសម្រេច។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Whatever it says, we'll be ready.",
      km: 'ទោះវាថាយ៉ាងណា យើងនឹងត្រៀមខ្លួនរួចរាល់។',
    }),
  ]),

  'ch2-group-fail': scene('dressing-room', 'sad', [
    narrate({
      en: 'Third in the group. Kampong Cham High is out.',
      km: 'លេខរៀងទីបីក្នុងពូល។ វិទ្យាល័យកំពង់ចាមធ្លាក់ហើយ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: "Out. Because we played like eleven people who'd never met.",
      km: 'ធ្លាក់។ ព្រោះយើងលេងដូចមនុស្សដប់មួយនាក់ដែលមិនស្គាល់គ្នា។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'So we go back to the steps. Then we play this group again, until we are a team.',
      km: 'ដូច្នេះ យើងត្រឡប់ទៅជណ្ដើរវិញ។ រួចយើងលេងពូលនេះម្ដងទៀត រហូតដល់យើងក្លាយជាក្រុមមួយ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Again. From the first match.',
      km: 'ម្ដងទៀត។ ចាប់ពីការប្រកួតទីមួយ។',
    }),
  ]),
};
