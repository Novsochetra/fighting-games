import { narrate, say, scene } from '../script.js';

const FULL_POWER = {
  en: 'I was not playing at full power. See you in the final.',
  km: 'ខ្ញុំមិនទាន់លេងអស់កម្លាំងទេ។ ជួបគ្នានៅវគ្គផ្ដាច់ព្រ័ត្រ។',
};

export const JAPAN_SCENES = {
  'ch3-japan-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Group match one. Japan, the champions of Asia, and their playmaker, Haruto.',
      km: 'ការប្រកួតពូលទីមួយ។ ជប៉ុន ម្ចាស់ជើងឯកអាស៊ី និងខ្សែបម្រើគន្លឹះរបស់គេ ហារូតូ។',
    }),
    say('haruto', 'neutral', 'right', {
      en: 'Cambodia. I watched your games. Brave. Loud. And all the wrong angles.',
      km: 'កម្ពុជា។ ខ្ញុំបានមើលការប្រកួតរបស់អ្នក។ ក្លាហាន។ សំឡេងខ្លាំង។ ហើយមុំខុសទាំងអស់។',
    }),
    say('haruto', 'neutral', 'right', {
      en: "I don't need to run fast. The ball runs for me.",
      km: 'ខ្ញុំមិនចាំបាច់រត់លឿនទេ។ បាល់រត់ជំនួសខ្ញុំ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Then I'll just have to catch the ball.",
      km: 'អញ្ចឹង ខ្ញុំត្រូវតែចាប់បាល់ឲ្យទាន់។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'They are the best in Asia. Play our game, and learn. Whatever happens, the group goes on.',
      km: 'គេជាក្រុមល្អបំផុតនៅអាស៊ី។ លេងតាមរបៀបយើង ហើយរៀនសូត្រ។ ទោះយ៉ាងណា វគ្គចែកពូលនៅបន្ត។',
    }),
  ]),

  'ch3-japan-kickoff': scene('black', 'tense', [
    say('haruto', 'neutral', 'right', {
      en: "Show me something I haven't seen before.",
      km: 'បង្ហាញខ្ញុំនូវអ្វីដែលខ្ញុំមិនធ្លាប់ឃើញ។',
    }),
  ]),

  'ch3-japan-duel': scene('black', 'tense', [
    say('haruto', 'smirk', 'right', {
      en: 'Your shot is loud. Mine is silent.',
      km: 'ស៊ុតរបស់អ្នកឮខ្លាំង។ ស៊ុតរបស់ខ្ញុំស្ងាត់។',
    }),
    say('sochetra', 'shocked', 'left', {
      en: "He's already standing where the ball is going...",
      km: 'គេទៅឈរនៅកន្លែងដែលបាល់នឹងទៅដល់ មុនបាត់ទៅហើយ...',
    }),
  ]),

  'ch3-japan-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Japan score! Calm, clinical, and quiet as the moon.',
      km: 'ជប៉ុនស៊ុតចូល! ស្ងប់ ច្បាស់លាស់ និងស្ងាត់ដូចព្រះច័ន្ទ។',
    }),
    say('rithy', 'angry', 'right', {
      en: 'Sochetra, you were supposed to track him!',
      km: 'សុចិត្រា ឯងត្រូវតាមគេ!',
    }),
    say('sochetra', 'angry', 'left', {
      en: 'And you were supposed to pass!',
      km: 'ហើយឯងត្រូវហុចបាល់!',
    }),
    say('dara', 'angry', 'right', {
      en: 'Both of you, quiet! Play!',
      km: 'ទាំងពីរនាក់ ស្ងាត់មាត់! លេងទៅ!',
    }),
  ]),

  'ch3-japan-halftime': scene('dressing-room', 'tense', [
    say('coach-bora', 'neutral', 'right', {
      en: 'They move as one. We move as eleven. Talk to each other out there.',
      km: 'គេរំកិលខ្លួនដូចមនុស្សម្នាក់។ យើងរំកិលដូចមនុស្សដប់មួយនាក់។ និយាយគ្នាលើទីលាន។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Rithy. Sochetra. Look at each other. That's your first pass.",
      km: 'រិទ្ធី។ សុចិត្រា។ មើលមុខគ្នា។ នោះជាការហុចទីមួយរបស់ឯង។',
    }),
  ]),

  'ch3-japan-lose': scene('dressing-room', 'sad', [
    narrate({
      en: 'Full time. The scoreboard does not lie. Japan are better, and everyone knows it.',
      km: 'ចប់ការប្រកួត។ តារាងពិន្ទុមិនកុហកទេ។ ជប៉ុនពូកែជាង ហើយគ្រប់គ្នាដឹង។',
    }),
    narrate({
      en: 'In the dressing room, nobody speaks. Somewhere, a tap drips.',
      km: 'នៅក្នុងបន្ទប់ផ្លាស់សម្លៀកបំពាក់ គ្មាននរណានិយាយទេ។ មានតែទឹកម៉ាស៊ីនស្រក់ៗ។',
    }),
    say('rithy', 'angry', 'right', {
      en: "If you'd passed once. Just once...",
      km: 'បើឯងហុចបាល់ម្ដង។ គ្រាន់តែម្ដង...',
    }),
    say('sochetra', 'cry', 'left', { en: "You're right.", km: 'ឯងនិយាយត្រូវ។' }),
    say('rithy', 'shocked', 'right', { en: '...What?', km: '...អ្វី?' }),
    say('sochetra', 'sad', 'left', {
      en: 'I played for me. Ta Sok told me the Naga only wakes when you play for others.',
      km: 'ខ្ញុំលេងដើម្បីខ្លួនឯង។ លោកតាប្រាប់ខ្ញុំថា នាគភ្ញាក់តែពេលយើងលេងដើម្បីអ្នកដទៃ។',
    }),
    say('rithy', 'sad', 'right', {
      en: "...I didn't pass either. I wanted them to see me. Not us. Me.",
      km: '...ខ្ញុំក៏មិនហុចដែរ។ ខ្ញុំចង់ឲ្យគេឃើញខ្ញុំ។ មិនមែនយើងទេ។ ខ្ញុំ។',
    }),
    say('haruto', 'neutral', 'right', {
      en: 'You were not bad. You were two good teams on one pitch. Become one.',
      km: 'អ្នកមិនអាក្រក់ទេ។ អ្នកជាក្រុមល្អពីរ នៅលើទីលានតែមួយ។ ចូរក្លាយជាក្រុមតែមួយ។',
    }),
    say('haruto', 'neutral', 'right', {
      en: 'Then I will see you in the final.',
      km: 'ពេលនោះ យើងនឹងជួបគ្នានៅវគ្គផ្ដាច់ព្រ័ត្រ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Thailand and Korea are left. Win both and we go through. Lift your heads.',
      km: 'នៅសល់ថៃ និងកូរ៉េ។ ឈ្នះទាំងពីរ យើងឡើងវគ្គបន្ទាប់។ ងើបមុខឡើង។',
    }),
  ]),

  'ch3-japan-win': scene('stadium-tunnel', 'hope', [
    say('announcer', 'shocked', 'right', {
      en: 'Cambodia beat Japan! Nobody in Asia saw this coming!',
      km: 'កម្ពុជាឈ្នះជប៉ុន! គ្មាននរណានៅអាស៊ីរំពឹងទុកទេ!',
    }),
    say('haruto', 'smirk', 'right', FULL_POWER),
    say('rithy', 'angry', 'right', {
      en: "Not at full power? He's bluffing.",
      km: 'មិនទាន់អស់កម្លាំង? គេបំភ័ន្តទេ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "He isn't. Japan rested three starters today. Don't celebrate yet.",
      km: 'មិនមែនទេ។ ថ្ងៃនេះជប៉ុនទុកកីឡាករគោលបីនាក់ឲ្យសម្រាក។ កុំទាន់អបអរ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Then next time, we'll be at full power too.",
      km: 'អញ្ចឹងលើកក្រោយ យើងក៏នឹងលេងអស់កម្លាំងដែរ។',
    }),
  ]),

  'ch3-japan-draw': scene('stadium-tunnel', 'hope', [
    say('haruto', 'neutral', 'right', {
      en: "A draw. You surprised me, Cambodia. That doesn't happen often.",
      km: 'ស្មើ។ អ្នកធ្វើឲ្យខ្ញុំភ្ញាក់ផ្អើល កម្ពុជា។ រឿងនេះមិនសូវកើតឡើងទេ។',
    }),
    say('haruto', 'smirk', 'right', FULL_POWER),
    say('coach-bora', 'neutral', 'right', {
      en: 'One point from the best. Now take three from Thailand.',
      km: 'មួយពិន្ទុពីក្រុមល្អបំផុត។ ឥឡូវយកបីពិន្ទុពីថៃ។',
    }),
  ]),
};
