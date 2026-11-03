import { narrate, say, scene } from '../script.js';

export const ENDING_SCENES = {
  'ch1-final-win': scene('trophy-stage', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: "It's over! Chrey School, from a village with bamboo goals, are the national champions!",
      km: 'ចប់ហើយ! សាលាជ្រៃ មកពីភូមិដែលមានទីធ្វើពីឫស្សី ក្លាយជាជើងឯកថ្នាក់ជាតិ!',
    }),
    say('coach-vannak', 'cry', 'right', {
      en: "I'm not crying. It's... the floodlights. They're very bright.",
      km: 'គ្រូមិនយំទេ។ គឺ... ភ្លើងកីឡដ្ឋាន។ វាភ្លឺពេក។',
    }),
    say('rithy', 'angry', 'right', {
      en: "This isn't over, Sochetra. Next time, I'll be the one holding that cup.",
      km: 'រឿងនេះមិនទាន់ចប់ទេ សុចិត្រា។ លើកក្រោយ ខ្ញុំជាអ្នកលើកពាននោះ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: "I'll be waiting. Good game, Rithy.",
      km: 'ខ្ញុំនឹងរង់ចាំ។ លេងបានល្អ រិទ្ធី។',
    }),
    narrate({
      en: 'Sochetra holds out his hand. Rithy looks at it for a long time, then walks away.',
      km: 'សុចិត្រាលូកដៃទៅ។ រិទ្ធីសម្លឹងមើលវាយូរ រួចដើរចេញទៅ។',
    }),
    say('ta-sok', 'cry', 'right', {
      en: 'You played for them, grandchild. That is why the river was with you.',
      km: 'ចៅលេងដើម្បីពួកគេ។ ហេតុនេះហើយ ទើបទន្លេនៅជាមួយចៅ។',
    }),
  ]),

  'ch1-final-lose': scene('dressing-room', 'sad', [
    say('sochetra', 'cry', 'left', {
      en: "I had Ta Sok's krama on my wrist... and I still lost.",
      km: 'ខ្ញុំចងក្រមាលោកតានៅកដៃ... តែនៅតែចាញ់។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: "A krama doesn't win matches. A heart does. And yours is still beating.",
      km: 'ក្រមាមិនឈ្នះការប្រកួតទេ។ គឺបេះដូងទេដែលឈ្នះ។ ហើយបេះដូងក្មួយនៅលោតនៅឡើយ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'We train tonight. We play them again. And this time, we play as one.',
      km: 'យប់នេះយើងហ្វឹកហាត់។ យើងប្រកួតជាមួយគេម្ដងទៀត។ ហើយលើកនេះ យើងលេងជាធ្លុងមួយ។',
    }),
    say('dara', 'determined', 'right', {
      en: "Again! I'm ready. I'll eat two bananas this time.",
      km: 'ម្ដងទៀត! ខ្ញុំរួចរាល់ហើយ។ លើកនេះខ្ញុំញ៉ាំចេកពីរ។',
    }),
  ]),

  'ch1-ending': scene('village-dusk', 'hope', [
    narrate({
      en: 'Chrey had never seen a party like it. Even the buffalo got flowers.',
      km: 'ភូមិជ្រៃមិនដែលមានពិធីសប្បាយបែបនេះទេ។ សូម្បីតែក្របីក៏បានផ្កាដែរ។',
    }),
    say('neary', 'happy', 'right', {
      en: 'My son, a champion. Come and eat. Champions still wash their own plates.',
      km: 'កូនម៉ែ ជាជើងឯកហើយ។ មកញ៉ាំបាយ។ ជើងឯកក៏ត្រូវលាងចានខ្លួនឯងដែរ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Ta, here. Your krama, and the medal. Both of them belong to you.',
      km: 'លោកតា នេះ។ ក្រមារបស់លោកតា និងមេដាយ។ ទាំងពីរជារបស់លោកតា។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Keep the medal. One day, give it to the next child who needs a dream.',
      km: 'ទុកមេដាយទៅ។ ថ្ងៃណាមួយ ឲ្យវាទៅក្មេងបន្ទាប់ដែលត្រូវការក្ដីស្រមៃ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Sochetra. This is only the beginning. Keep watering that seed.',
      km: 'សុចិត្រា។ នេះគ្រាន់តែជាការចាប់ផ្ដើម។ បន្តស្រោចទឹកគ្រាប់ពូជនោះ។',
    }),
    narrate({
      en: 'Four rainy seasons came and went. The boy grew. And so did the dream.',
      km: 'រដូវវស្សាបួនដងបានមកហើយទៅ។ ក្មេងប្រុសនោះធំឡើង។ ហើយក្ដីស្រមៃក៏ធំឡើងដែរ។',
    }),
  ]),
};
