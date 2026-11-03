import { narrate, say, scene } from '../script.js';

export const FINAL_SCENES = {
  'ch2-final-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Thousands have come to the national stadium. Even Coach Vannak, with half of Chrey on a rented bus.',
      km: 'មនុស្សរាប់ពាន់នាក់មកកីឡដ្ឋានជាតិ។ សូម្បីតែលោកគ្រូវណ្ណៈ ជាមួយអ្នកភូមិជ្រៃពាក់កណ្ដាល លើឡានក្រុងជួល។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Sochetra! Look at you. That seed grew into a tree.',
      km: 'សុចិត្រា! មើលក្មួយមើល។ គ្រាប់ពូជនោះដុះជាដើមឈើហើយ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: "Vannak. So you're the one who started all this.",
      km: 'វណ្ណៈ។ អញ្ចឹងលោកជាអ្នកចាប់ផ្ដើមរឿងទាំងអស់នេះ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: "And you're the one who'll finish it. Thank you for being hard on him.",
      km: 'ហើយលោកជាអ្នកបញ្ចប់វា។ អរគុណដែលតឹងរ៉ឹងជាមួយគេ។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Eleven, Sochetra. Not one. Go.',
      km: 'ដប់មួយនាក់ សុចិត្រា។ មិនមែនម្នាក់។ ទៅ។',
    }),
  ]),

  'ch2-final-kickoff': scene('black', 'tense', [
    say('rithy', 'smirk', 'right', {
      en: 'No bamboo goals today, Chrey. Just you, me, and a whole stadium watching.',
      km: 'ថ្ងៃនេះគ្មានទីឫស្សីទេ ជ្រៃ។ មានតែឯង ខ្ញុំ និងកីឡដ្ឋានទាំងមូលកំពុងមើល។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'And ten friends. You forgot about them.',
      km: 'ហើយមិត្តដប់នាក់ទៀត។ ឯងភ្លេចពួកគេហើយ។',
    }),
  ]),

  'ch2-final-duel': scene('black', 'tense', [
    say('rithy', 'determined', 'right', {
      en: 'I lost to you once. I will never lose to you again.',
      km: 'ខ្ញុំចាញ់ឯងម្ដង។ ខ្ញុំនឹងមិនចាញ់ឯងម្ដងទៀតទេ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Then stop talking and play!',
      km: 'អញ្ចឹង ឈប់និយាយ ហើយលេងមក!',
    }),
  ]),

  'ch2-final-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Phnom Penh Elite lead! The capital is roaring!',
      km: 'ភ្នំពេញ អេលីត នាំមុខហើយ! រាជធានីស្រែកហ៊ោកញ្ជ្រៀវ!',
    }),
    say('dara', 'angry', 'right', {
      en: "My fault! The next one doesn't get past me!",
      km: 'កំហុសខ្ញុំ! គ្រាប់ក្រោយមិនឲ្យហួសខ្ញុំទេ!',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Heads up! We answer together!',
      km: 'ងើបមុខឡើង! យើងតបវិញជាមួយគ្នា!',
    }),
  ]),

  'ch2-final-sword': scene('black', 'tense', [
    say('rithy', 'smirk', 'right', {
      en: 'That was Preah Khan Strike. The sword of kings. Did you like it?',
      km: 'នោះគឺទាត់ព្រះខ័ន។ ដាវរបស់ព្រះមហាក្សត្រ។ ចូលចិត្តទេ?',
    }),
    say('sochetra', 'angry', 'left', {
      en: '...It was beautiful. I hate it.',
      km: '...ស្អាតណាស់។ ខ្ញុំស្អប់វា។',
    }),
  ]),

  'ch2-final-halftime': scene('dressing-room', 'tense', [
    say('coach-sokha', 'neutral', 'right', {
      en: "You're trying to beat Rithy alone. That's his game. Don't play it.",
      km: 'ឯងកំពុងព្យាយាមឈ្នះរិទ្ធីតែម្នាក់ឯង។ នោះជាល្បែងរបស់គេ។ កុំលេងតាមគេ។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Our wingers are free all day. Give it wide, then get into the box.',
      km: 'កីឡាករគែមរបស់យើងទំនេររហូត។ ហុចចេញទៅគែម រួចរត់ចូលក្នុងប្រអប់។',
    }),
    say('dara', 'happy', 'right', {
      en: "Coach Vannak's bus is singing in the stand. Badly. But loudly.",
      km: 'អ្នកភូមិលើឡានក្រុងលោកគ្រូវណ្ណៈ កំពុងច្រៀងនៅលើកន្លែងអង្គុយ។ មិនពីរោះទេ។ តែខ្លាំងណាស់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Wide, then the box. Got it.',
      km: 'ចេញទៅគែម រួចចូលប្រអប់។ យល់ហើយ។',
    }),
  ]),

  'ch2-final-garuda': scene('temple-dawn', 'hope', [
    narrate({
      en: 'Fifteen minutes left. A cross comes in from the wing. High. Far too high.',
      km: 'នៅសល់ដប់ប្រាំនាទី។ បាល់បញ្ជូនមកពីគែម។ ខ្ពស់។ ខ្ពស់ពេក។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Football is eleven, Sochetra! Trust the ball they give you!',
      km: 'បាល់ទាត់គឺដប់មួយនាក់ សុចិត្រា! ទុកចិត្តបាល់ដែលគេហុចឲ្យ!',
    }),
    say('sochetra', 'determined', 'left', {
      en: "They carried this ball all the way here for me. I won't waste it.",
      km: 'ពួកគេនាំបាល់នេះមកដល់ទីនេះសម្រាប់ខ្ញុំ។ ខ្ញុំមិនឲ្យវាខាតទេ។',
    }),
    narrate({
      en: 'He rises, arms spread like the Garuda over the temple gates.',
      km: 'គេហោះឡើង ដៃលាតសន្ធឹង ដូចគ្រុឌលើខ្លោងទ្វារប្រាសាទ។',
    }),
    say('sochetra', 'determined', 'left', { en: 'GARUDA VOLLEY!', km: 'ទាត់គ្រុឌ!' }),
    narrate({
      en: "Garuda Volley learned! A flying strike, met from a friend's cross.",
      km: 'បានរៀន ទាត់គ្រុឌ! ការទាត់ហោះលើអាកាស ពីបាល់បញ្ជូនរបស់មិត្ត។',
    }),
  ]),

  'ch2-final-push': scene('black', 'hope', [
    say('dara', 'determined', 'right', {
      en: "It's level! Ten minutes! I'll hold the back, you finish it!",
      km: 'ពិន្ទុស្មើគ្នា! ដប់នាទីទៀត! ខ្ញុំការពារខាងក្រោយ ឯងបញ្ចប់វា!',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'All eleven of you, now!',
      km: 'ទាំងដប់មួយនាក់ ឥឡូវនេះ!',
    }),
  ]),

  'ch2-final-garuda-goal': scene('black', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: 'He flew! Sochetra flew over everyone and volleyed it in!',
      km: 'គេហោះ! សុចិត្រាហោះលើគ្រប់គ្នា ហើយទាត់បាល់ក្នុងអាកាសចូលទី!',
    }),
    say('rithy', 'shocked', 'right', {
      en: "A new shot... He's still growing.",
      km: 'ស៊ុតថ្មីមួយទៀត... គេនៅតែរីកចម្រើន។',
    }),
    say('coach-bora', 'happy', 'right', { en: 'There it is.', km: 'ឃើញហើយ។' }),
  ]),
};
