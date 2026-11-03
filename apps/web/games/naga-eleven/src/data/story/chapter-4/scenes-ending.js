import { narrate, say, scene, villager } from '../script.js';

const NEIGHBOUR = { name: { en: 'Neighbour', km: 'អ្នកជិតខាង' }, age: 'adult' };

export const ENDING_SCENES = {
  'ch4-final-seven': scene('village-tv', 'hope', [
    narrate({
      en: 'Fifteen minutes left. Sochetra can barely stand. And then, he hears them.',
      km: 'នៅសល់ដប់ប្រាំនាទី។ សុចិត្រាស្ទើរតែឈរមិនរួច។ ហើយពេលនោះ គេឮសំឡេងពួកគេ។',
    }),
    say('neary', 'happy', 'right', {
      en: "Champions don't play hungry, my son.",
      km: 'ជើងឯកមិនលេងទាំងពោះទទេទេ កូន។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Not for yourself. For them.',
      km: 'មិនមែនដើម្បីខ្លួនឯងទេ។ ដើម្បីពួកគេ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'A gift is a seed. Look how it grew.',
      km: 'ទេពកោសល្យជាគ្រាប់ពូជ។ មើលចុះ វាដុះធំយ៉ាងណា។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Eleven, Sochetra. Never one.',
      km: 'ដប់មួយនាក់ សុចិត្រា។ មិនដែលម្នាក់ទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Give them something to remember.',
      km: 'ផ្ដល់ឲ្យពួកគេនូវអ្វីដែលគួរចងចាំ។',
    }),
    say('dara', 'happy', 'right', {
      en: "I've got the back. I always have.",
      km: 'ខ្ញុំការពារខាងក្រោយ។ ខ្ញុំតែងតែការពារ។',
    }),
    say('rithy', 'happy', 'right', {
      en: 'Pass it back, partner.',
      km: 'ហុចវាត្រឡប់មកវិញ ដៃគូ។',
    }),
    narrate({
      en: 'Seven voices. Seven heads of light rise behind him, wide as the Mekong.',
      km: 'សំឡេងប្រាំពីរ។ ក្បាលពន្លឺប្រាំពីរងើបឡើងពីក្រោយគេ ធំទូលាយដូចទន្លេមេគង្គ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Everyone who carried me... this is for you. SEVEN-HEADED NAGA!',
      km: 'គ្រប់គ្នាដែលបានលីខ្ញុំមក... នេះសម្រាប់អ្នកទាំងអស់គ្នា។ នាគប្រាំពីរក្បាល!',
    }),
    narrate({
      en: "Seven-Headed Naga learned! Sochetra's last and greatest shot.",
      km: 'បានរៀន នាគប្រាំពីរក្បាល! ការទាត់ចុងក្រោយ និងខ្លាំងបំផុតរបស់សុចិត្រា។',
    }),
  ]),

  'ch4-final-win': scene('trophy-stage', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: "It's over! Cambodia are the champions of the world!",
      km: 'ចប់ហើយ! កម្ពុជាជាជើងឯកពិភពលោក!',
    }),
    say('rafael', 'happy', 'right', {
      en: 'You made me smile even while losing. Obrigado, Cambodia. Truly.',
      km: 'អ្នកធ្វើឲ្យខ្ញុំញញឹម សូម្បីពេលចាញ់។ អរគុណ កម្ពុជា។ ពិតជាអរគុណមែន។',
    }),
    say('rithy', 'cry', 'right', {
      en: 'We did it. Eleven-year-old me would never believe this.',
      km: 'យើងធ្វើបានហើយ។ ខ្ញុំកាលអាយុដប់មួយឆ្នាំ មិនដែលជឿរឿងនេះទេ។',
    }),
    say('dara', 'cry', 'right', {
      en: "The floodlights. It's the floodlights. For all of us.",
      km: 'ភ្លើងកីឡដ្ឋាន។ គឺភ្លើងកីឡដ្ឋាន។ សម្រាប់យើងទាំងអស់គ្នា។',
    }),
    say('coach-bora', 'cry', 'right', {
      en: 'Lift it, Sochetra. Lift it for everyone who never got the chance.',
      km: 'លើកវាឡើង សុចិត្រា។ លើកវាសម្រាប់អ្នកដែលមិនដែលមានឱកាស។',
    }),
    narrate({
      en: 'Sochetra lifts the trophy. Around his wrist, an old red-and-white krama.',
      km: 'សុចិត្រាលើកពានរង្វាន់ឡើង។ នៅកដៃគេ មានក្រមាក្រហមសចាស់មួយ។',
    }),
  ]),

  'ch4-final-lose': scene('dressing-room', 'sad', [
    say('rafael', 'neutral', 'right', {
      en: "Don't look at the floor, my friend. Look at me. I want this final again.",
      km: 'កុំសម្លឹងមើលដី មិត្តខ្ញុំ។ មើលមកខ្ញុំ។ ខ្ញុំចង់លេងវគ្គផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'So do we. We train, and we play this final again. Seven heads, Sochetra.',
      km: 'យើងក៏ចង់ដែរ។ យើងហ្វឹកហាត់ ហើយលេងវគ្គផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។ ក្បាលប្រាំពីរ សុចិត្រា។',
    }),
  ]),

  'ch4-chrey': scene('village-tv', 'triumph', [
    villager(NEIGHBOUR, {
      en: 'CAMBODIA! CAMBODIA! WE ARE THE CHAMPIONS OF THE WORLD!',
      km: 'កម្ពុជា! កម្ពុជា! យើងជាជើងឯកពិភពលោក!',
    }),
    say('coach-vannak', 'cry', 'right', {
      en: "I'm not crying. The TV is too bright.",
      km: 'គ្រូមិនយំទេ។ ទូរទស្សន៍ភ្លឺពេក។',
    }),
    say('neary', 'cry', 'right', { en: 'My son... my son...', km: 'កូនម៉ែ... កូនម៉ែ...' }),
    say('ta-sok', 'cry', 'right', {
      en: 'I saw it. Eighty years I waited, and I saw it.',
      km: 'តាបានឃើញហើយ។ តារង់ចាំប៉ែតសិបឆ្នាំ ហើយតាបានឃើញ។',
    }),
    narrate({
      en: 'That night, all of Chrey dances the romvong until dawn.',
      km: 'យប់នោះ អ្នកភូមិជ្រៃទាំងអស់រាំរាំវង់រហូតដល់ភ្លឺ។',
    }),
  ]),
};
