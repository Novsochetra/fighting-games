import { narrate, say, scene } from '../script.js';

export const FINAL_SCENES = {
  'ch1-final-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The final of the National Primary Schools Cup. A concrete bowl, and two thousand voices.',
      km: 'វគ្គផ្ដាច់ព្រ័ត្រ ពានរង្វាន់បាល់ទាត់បឋមសិក្សាថ្នាក់ជាតិ។ កីឡដ្ឋានបេតុង និងសំឡេងមនុស្សពីរពាន់នាក់។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: "On paper, they are better than us. But paper doesn't play football.",
      km: 'លើក្រដាស គេពូកែជាងយើង។ ប៉ុន្តែក្រដាសមិនចេះលេងបាល់ទាត់ទេ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Whatever happens, I am proud of you. Now go, and make the village proud.',
      km: 'ទោះយ៉ាងណាក៏ដោយ គ្រូមានមោទនភាពនឹងក្មួយៗ។ ទៅ ធ្វើឲ្យអ្នកភូមិមានមោទនភាព។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Ta Sok's krama is tied around my wrist. Let's go, Chrey!",
      km: 'ក្រមាលោកតាចងនៅកដៃខ្ញុំ។ ទៅ ជ្រៃ!',
    }),
  ]),

  'ch1-final-kickoff': scene('black', 'tense', [
    say('rithy', 'smirk', 'right', {
      en: "Two number tens on one pitch. Shame there's only room for one winner.",
      km: 'លេខដប់ពីរនាក់នៅលើទីលានតែមួយ។ គួរឲ្យស្ដាយ ដែលអ្នកឈ្នះមានតែម្នាក់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Then let the ball decide.',
      km: 'អញ្ចឹង ទុកឲ្យបាល់ជាអ្នកសម្រេច។',
    }),
  ]),

  'ch1-final-duel': scene('black', 'tense', [
    say('rithy', 'smirk', 'right', {
      en: "You're quick, village boy. But quick isn't enough.",
      km: 'ឯងលឿនមែន ក្មេងស្រែ។ តែលឿនតែប៉ុណ្ណឹង មិនគ្រប់គ្រាន់ទេ។',
    }),
    say('sochetra', 'angry', 'left', { en: 'Stop calling me that!', km: 'ឈប់ហៅខ្ញុំបែបនោះ!' }),
    say('rithy', 'smirk', 'right', { en: 'Make me.', km: 'ធ្វើឲ្យខ្ញុំឈប់មើល។' }),
    narrate({
      en: 'One on one! Choose your move, and try to read his.',
      km: 'មួយទល់មួយ! ជ្រើសចលនារបស់ឯង ហើយព្យាយាមទាយចលនារបស់គេ។',
    }),
  ]),

  'ch1-final-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Royal Kids strike first! The city team is in control!',
      km: 'កុមាររាជធានីស៊ុតចូលមុន! ក្រុមទីក្រុងកំពុងគ្រប់គ្រងល្បែង!',
    }),
    say('dara', 'sad', 'right', {
      en: 'Sorry, everyone. It was too fast.',
      km: 'សុំទោសគ្រប់គ្នា។ វាលឿនពេក។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Heads up, Dara! One goal is nothing. We answer!',
      km: 'ងើបមុខឡើង ដារ៉ា! មួយគ្រាប់មិនអីទេ។ យើងនឹងតបវិញ!',
    }),
  ]),

  'ch1-final-halftime': scene('dressing-room', 'tense', [
    say('coach-vannak', 'neutral', 'right', {
      en: 'Rithy wants you to chase him. Every time you do, a door opens behind you.',
      km: 'រិទ្ធីចង់ឲ្យក្មួយដេញគេ។ រាល់ពេលក្មួយដេញ ចន្លោះមួយបើកនៅពីក្រោយក្មួយ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: "Stay together. Pass to the open friend. He plays alone. We don't.",
      km: 'នៅជិតគ្នា។ ហុចទៅមិត្តដែលទំនេរ។ គេលេងម្នាក់ឯង។ យើងមិនអញ្ចឹងទេ។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Also, I ate a banana. I feel very powerful now.',
      km: 'ម្យ៉ាងទៀត ខ្ញុំញ៉ាំចេកមួយហើយ។ ឥឡូវខ្ញុំមានកម្លាំងណាស់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'The second half is ours.',
      km: 'ពាក់កណ្ដាលម៉ោងទីពីរ ជារបស់យើង។',
    }),
  ]),

  'ch1-final-naga': scene('village-dusk', 'hope', [
    narrate({
      en: "The clock is running out. Sochetra's legs are heavy as stones. Then he hears it: the river.",
      km: 'ម៉ោងជិតអស់ហើយ។ ជើងសុចិត្រាធ្ងន់ដូចដុំថ្ម។ ពេលនោះ គេឮសំឡេងមួយ៖ ទន្លេ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Not for yourself, grandchild. For them.',
      km: 'មិនមែនដើម្បីខ្លួនឯងទេ ចៅ។ ដើម្បីពួកគេ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Dara. Teacher. Mae. Everyone on the fence back home...',
      km: 'ដារ៉ា។ លោកគ្រូ។ ម៉ែ។ អ្នកភូមិទាំងអស់ដែលអង្គុយលើរបងនៅស្រុក...',
    }),
    narrate({
      en: 'Deep under the Mekong, something ancient opens its eyes.',
      km: 'នៅជ្រៅក្រោមទន្លេមេគង្គ អ្វីមួយដ៏បុរាណបានបើកភ្នែក។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'I can feel it. The Naga is awake. NAGA SHOT!',
      km: 'ខ្ញុំមានអារម្មណ៍ហើយ។ នាគភ្ញាក់ហើយ។ ទាត់នាគ!',
    }),
    narrate({
      en: 'Naga Shot learned! With spirit to spend, hold SHOOT to a full charge and let go.',
      km: 'បានរៀន ទាត់នាគ! ពេលមានថាមពលគ្រប់គ្រាន់ សង្កត់ SHOOT ឲ្យពេញកម្លាំង រួចលែង។',
    }),
  ]),

  'ch1-final-push': scene('black', 'hope', [
    say('dara', 'determined', 'right', {
      en: "It's level! One more, Sochetra! Just one!",
      km: 'ពិន្ទុស្មើគ្នា! មួយគ្រាប់ទៀត សុចិត្រា! តែមួយគ្រាប់ទៀតទេ!',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Everyone forward! This is the moment we trained for!',
      km: 'ទាំងអស់គ្នា ឡើងទៅមុខ! នេះហើយជាពេលដែលយើងហ្វឹកហាត់ដើម្បីវា!',
    }),
  ]),

  'ch1-final-naga-goal': scene('black', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: 'What was THAT?! The ball rose like a serpent from the water!',
      km: 'នោះជាអ្វី?! បាល់ហោះឡើងដូចនាគចេញពីទឹក!',
    }),
    say('rithy', 'shocked', 'right', {
      en: "That's... not possible. Who is this kid?",
      km: 'នោះ... មិនអាចទៅរួចទេ។ ក្មេងនេះជានរណា?',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'That one was for Chrey!',
      km: 'មួយគ្រាប់នោះ សម្រាប់ភូមិជ្រៃ!',
    }),
  ]),
};
