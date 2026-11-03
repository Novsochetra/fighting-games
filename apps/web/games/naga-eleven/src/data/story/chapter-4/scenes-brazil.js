import { narrate, say, scene } from '../script.js';

const FULL_POWER = {
  en: 'I was not playing at full power. See you in the final!',
  km: 'ខ្ញុំមិនទាន់លេងអស់កម្លាំងទេ។ ជួបគ្នានៅវគ្គផ្ដាច់ព្រ័ត្រ!',
};

export const BRAZIL_SCENES = {
  'ch4-brazil-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Group match one. Brazil, and the most joyful player in the world: Rafael.',
      km: 'ការប្រកួតពូលទីមួយ។ ប្រេស៊ីល និងកីឡាករដែលសប្បាយរីករាយជាងគេលើលោក៖ រ៉ាហ្វាអែល។',
    }),
    say('rafael', 'happy', 'right', {
      en: "Cambodia! Hello, hello! You look so serious. Smile! It's football!",
      km: 'កម្ពុជា! សួស្ដី សួស្ដី! អ្នកមើលទៅម៉ឺងម៉ាត់ណាស់។ ញញឹមមើល! នេះជាបាល់ទាត់!',
    }),
    say('rafael', 'happy', 'right', {
      en: "If you don't smile when you play, why play at all?",
      km: 'បើលេងហើយមិនញញឹម តើលេងធ្វើអ្វី?',
    }),
    say('sochetra', 'shocked', 'left', {
      en: "He's... dancing in the tunnel.",
      km: 'គេ... កំពុងរាំនៅផ្លូវចូលទីលាន។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "Don't be fooled. He smiles while he takes you apart.",
      km: 'កុំចាញ់បោក។ គេញញឹម ពេលគេកំទេចអ្នក។',
    }),
  ]),

  'ch4-brazil-kickoff': scene('black', 'tense', [
    say('rafael', 'happy', 'right', { en: "Let's dance, number ten!", km: 'តោះរាំ លេខដប់!' }),
  ]),

  'ch4-brazil-duel': scene('black', 'tense', [
    say('rafael', 'smirk', 'right', {
      en: "Left? Right? Even I don't know where I'm going! Samba!",
      km: 'ឆ្វេង? ស្ដាំ? សូម្បីខ្ញុំក៏មិនដឹងថាខ្ញុំទៅណាដែរ! សាំបា!',
    }),
    say('sochetra', 'shocked', 'left', {
      en: "He's everywhere at once!",
      km: 'គេនៅគ្រប់កន្លែងក្នុងពេលតែមួយ!',
    }),
  ]),

  'ch4-brazil-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Brazil score, and the whole stadium is dancing!',
      km: 'ប្រេស៊ីលស៊ុតចូល ហើយកីឡដ្ឋានទាំងមូលកំពុងរាំ!',
    }),
    say('dara', 'sad', 'right', {
      en: 'I touched it. I definitely touched it. That counts for something, right?',
      km: 'ខ្ញុំប៉ះវាហើយ។ ប្រាកដជាប៉ះ។ នោះមានន័យខ្លះដែរ មែនទេ?',
    }),
  ]),

  'ch4-brazil-halftime': scene('dressing-room', 'tense', [
    say('coach-bora', 'neutral', 'right', {
      en: "They're better than us in every position. That's a fact, not an excuse.",
      km: 'គេពូកែជាងយើងគ្រប់តំណែង។ នោះជាការពិត មិនមែនជាលេសទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'But facts have lost to hearts before. Go out and play.',
      km: 'ប៉ុន្តែការពិតធ្លាប់ចាញ់បេះដូងពីមុនមកហើយ។ ចេញទៅលេង។',
    }),
  ]),

  'ch4-brazil-lose': scene('dressing-room', 'sad', [
    narrate({
      en: 'Full time. Brazil were too fast, too skilful, too much.',
      km: 'ចប់ការប្រកួត។ ប្រេស៊ីលលឿនពេក ពូកែពេក ខ្លាំងពេក។',
    }),
    say('sochetra', 'sad', 'left', {
      en: "Maybe they're right about us. Maybe we're too small for this stage.",
      km: 'ប្រហែលជាគេនិយាយត្រូវពីយើង។ ប្រហែលយើងតូចពេកសម្រាប់ឆាកនេះ។',
    }),
    say('rithy', 'angry', 'right', {
      en: "Don't. Don't you dare. I didn't learn to pass just to watch you quit.",
      km: 'កុំ។ កុំហ៊ាននិយាយអញ្ចឹង។ ខ្ញុំមិនបានរៀនហុចបាល់ ដើម្បីមើលឯងបោះបង់ទេ។',
    }),
    say('rafael', 'happy', 'right', {
      en: 'Hey, Cambodia. Why so sad? You made me run today. Nobody makes me run.',
      km: 'ហេ កម្ពុជា។ ហេតុអ្វីក្រៀមក្រំម្ល៉េះ? ថ្ងៃនេះអ្នកធ្វើឲ្យខ្ញុំរត់។ គ្មាននរណាធ្វើឲ្យខ្ញុំរត់បានទេ។',
    }),
    say('rafael', 'smirk', 'right', {
      en: 'Win your next two. I want to play you again in the final. With smiles.',
      km: 'ឈ្នះពីរប្រកួតបន្ទាប់ទៅ។ ខ្ញុំចង់លេងជាមួយអ្នកម្ដងទៀត នៅវគ្គផ្ដាច់ព្រ័ត្រ។ ទាំងស្នាមញញឹម។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Nigeria and Mexico. Two wins and we're through. Heads up.",
      km: 'នីហ្សេរីយ៉ា និងម៉ិកស៊ិក។ ឈ្នះពីរ យើងឡើងវគ្គបន្ទាប់។ ងើបមុខឡើង។',
    }),
  ]),

  'ch4-brazil-win': scene('stadium-tunnel', 'hope', [
    say('announcer', 'shocked', 'right', {
      en: 'Cambodia beat Brazil! The whole world is rubbing its eyes!',
      km: 'កម្ពុជាឈ្នះប្រេស៊ីល! ពិភពលោកទាំងមូលកំពុងត្រដុសភ្នែក!',
    }),
    say('rafael', 'happy', 'right', { en: 'Ahh, wonderful!', km: 'អា! អស្ចារ្យណាស់!' }),
    say('rafael', 'smirk', 'right', FULL_POWER),
    say('dara', 'shocked', 'right', {
      en: 'Why does everyone keep saying that to us?',
      km: 'ហេតុអ្វីបានជាគ្រប់គ្នាចេះតែនិយាយបែបនេះមកយើង?',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Because they mean it. Stay hungry.',
      km: 'ព្រោះគេនិយាយមែន។ បន្តឃ្លានជ័យជម្នះ។',
    }),
  ]),

  'ch4-brazil-draw': scene('stadium-tunnel', 'hope', [
    say('rafael', 'happy', 'right', {
      en: 'A draw with Cambodia! My mother will laugh at me. I love it!',
      km: 'ស្មើជាមួយកម្ពុជា! ម្ដាយខ្ញុំនឹងសើចចំអកខ្ញុំ។ ខ្ញុំចូលចិត្តណាស់!',
    }),
    say('rafael', 'smirk', 'right', FULL_POWER),
    say('coach-bora', 'neutral', 'right', {
      en: 'A point from Brazil. Now earn the rest.',
      km: 'មួយពិន្ទុពីប្រេស៊ីល។ ឥឡូវ រកពិន្ទុដែលនៅសល់។',
    }),
  ]),
};
