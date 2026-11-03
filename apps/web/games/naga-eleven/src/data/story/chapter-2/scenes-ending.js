import { narrate, say, scene } from '../script.js';

export const ENDING_SCENES = {
  'ch2-final-win': scene('trophy-stage', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: 'Kampong Cham High are the national champions! Sochetra does it again!',
      km: 'វិទ្យាល័យកំពង់ចាម ជាជើងឯកថ្នាក់ជាតិ! សុចិត្រាធ្វើបានម្ដងទៀត!',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Not me. Us. Eleven, Coach!',
      km: 'មិនមែនខ្ញុំទេ។ គឺយើង។ ដប់មួយនាក់ លោកគ្រូ!',
    }),
    say('coach-sokha', 'cry', 'right', {
      en: 'Hm. Must be the floodlights. Vannak warned me about them.',
      km: 'អឺ... ប្រហែលជាភ្លើងកីឡដ្ឋាន។ វណ្ណៈធ្លាប់ប្រាប់ខ្ញុំហើយ។',
    }),
    say('rithy', 'sad', 'right', {
      en: 'Twice. You beat me twice.',
      km: 'ពីរដង។ ឯងឈ្នះខ្ញុំពីរដងហើយ។',
    }),
    say('sochetra', 'neutral', 'left', {
      en: 'You made me better, Rithy. Both times.',
      km: 'ឯងធ្វើឲ្យខ្ញុំពូកែជាងមុន រិទ្ធី។ ទាំងពីរដង។',
    }),
    say('rithy', 'neutral', 'right', {
      en: "...Don't go soft on me. I'm not done.",
      km: '...កុំទន់ជ្រាយជាមួយខ្ញុំ។ ខ្ញុំមិនទាន់ចប់ទេ។',
    }),
  ]),

  'ch2-final-lose': scene('dressing-room', 'sad', [
    say('sochetra', 'cry', 'left', {
      en: 'His sword was sharper today.',
      km: 'ថ្ងៃនេះ ដាវរបស់គេមុតជាង។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Then we sharpen yours. We train, and we play this final again.',
      km: 'អញ្ចឹងយើងសំលៀងដាវរបស់ឯង។ យើងហ្វឹកហាត់ ហើយលេងវគ្គផ្ដាច់ព្រ័ត្រនេះម្ដងទៀត។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: "A seed doesn't stop growing because of one dry day.",
      km: 'គ្រាប់ពូជមិនឈប់ដុះ ព្រោះតែថ្ងៃរាំងស្ងួតមួយថ្ងៃនោះទេ។',
    }),
  ]),

  'ch2-letter': scene('home-night', 'hope', [
    narrate({
      en: "A week later, a white envelope with the federation's stamp arrives in Chrey.",
      km: 'មួយសប្ដាហ៍ក្រោយមក ស្រោមសំបុត្រពណ៌សមួយ ដែលមានត្រាសហព័ន្ធ មកដល់ភូមិជ្រៃ។',
    }),
    say('neary', 'shocked', 'right', {
      en: 'Sochetra! Read it! My hands are shaking too much.',
      km: 'សុចិត្រា! អានមើល! ដៃម៉ែញ័រខ្លាំងពេក។',
    }),
    say('sochetra', 'shocked', 'left', {
      en: '"Called up to the national youth team. Signed, Coach Bora."',
      km: '«ត្រូវបានកោះហៅចូលក្រុមជម្រើសជាតិយុវជន។ ចុះហត្ថលេខា លោកគ្រូបូរ៉ា។»',
    }),
    say('neary', 'cry', 'right', {
      en: "My boy. The noodle seller's boy. Playing for Cambodia.",
      km: 'កូនម៉ែ។ កូនអ្នកលក់នំបញ្ចុក។ នឹងលេងឲ្យកម្ពុជា។',
    }),
    say('dara', 'happy', 'right', {
      en: "SOCHETRA! I got a letter too! It says I'm on the national team!",
      km: 'សុចិត្រា! ខ្ញុំក៏បានសំបុត្រដែរ! សំបុត្រខ្ញុំថា ខ្ញុំចូលក្រុមជម្រើសជាតិ!',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Read the list of players, grandchild. All of it.',
      km: 'អានបញ្ជីឈ្មោះកីឡាករ ចៅ។ អានឲ្យអស់។',
    }),
    say('sochetra', 'shocked', 'left', {
      en: 'Dara... me... and... Rithy. RITHY?!',
      km: 'ដារ៉ា... ខ្ញុំ... ហើយ... រិទ្ធី។ រិទ្ធី?!',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Ha! The river has a sense of humour.',
      km: 'ហាហា! ទន្លេក៏ចេះលេងសើចដែរ។',
    }),
  ]),
};
