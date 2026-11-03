import { narrate, say, scene, villager } from '../script.js';

const BOPHA = { name: { en: 'Bopha', km: 'បុប្ផា' }, age: 'child', sex: 'female' };

export const EPILOGUE_SCENES = {
  'ch4-epilogue-angkor': scene('angkor-sunrise', 'calm', [
    narrate({
      en: 'Some weeks later. Sunrise over Angkor Wat, the sky gold behind its five towers.',
      km: 'ប៉ុន្មានសប្ដាហ៍ក្រោយមក។ ព្រះអាទិត្យរះលើអង្គរវត្ត មេឃពណ៌មាសនៅពីក្រោយកំពូលទាំងប្រាំ។',
    }),
    narrate({
      en: 'Nine hundred years ago, our ancestors built this. They believed in big things.',
      km: 'កាលពីប្រាំបួនរយឆ្នាំមុន ដូនតាយើងបានសាងសង់ប្រាសាទនេះ។ ពួកគាត់ជឿលើរឿងធំៗ។',
    }),
    say('sochetra', 'neutral', 'left', {
      en: 'Ta always said the Naga guards the river. I think it guards something else too.',
      km: 'លោកតាតែងនិយាយថា នាគការពារទន្លេ។ ខ្ញុំគិតថាវាការពារអ្វីមួយផ្សេងទៀតដែរ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'The dreams of every child who has ever kicked a ball by the water.',
      km: 'ក្ដីស្រមៃរបស់ក្មេងគ្រប់រូប ដែលធ្លាប់ទាត់បាល់នៅមាត់ទឹក។',
    }),
  ]),

  'ch4-epilogue-chrey': scene('village-dawn', 'hope', [
    narrate({
      en: 'Chrey village, at dawn. Mist on the paddies. A little girl kicks a patched ball at a bamboo goal.',
      km: 'ភូមិជ្រៃ ពេលព្រលឹម។ អ័ព្ទលើវាលស្រែ។ ក្មេងស្រីតូចម្នាក់កំពុងទាត់បាល់ចាស់ប៉ះៗ ទៅកាន់ទីឫស្សី។',
    }),
    narrate({
      en: 'The ball rolls away, all the way to a pair of feet.',
      km: 'បាល់រមៀលចេញ រហូតដល់ជើងមនុស្សម្នាក់។',
    }),
    villager(
      { ...BOPHA, mood: 'shocked' },
      { en: "You're... you're Big Brother Sochetra!", km: 'បង... បងសុចិត្រា!' },
    ),
    say('sochetra', 'happy', 'left', {
      en: 'And you have a good left foot. Who taught you?',
      km: 'ហើយប្អូនមានជើងឆ្វេងល្អណាស់។ អ្នកណាបង្រៀនប្អូន?',
    }),
    villager(BOPHA, {
      en: 'The chickens. They never run in a straight line.',
      km: 'មាន់ ចាស។ វាមិនដែលរត់ត្រង់ទេ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Ha! The chickens are the best coaches in Cambodia.',
      km: 'ហាហា! មាន់ជាគ្រូបង្វឹកពូកែជាងគេនៅកម្ពុជា។',
    }),
    narrate({
      en: 'He takes a medal from his pocket. Small and old, from a primary schools cup, long ago.',
      km: 'គេយកមេដាយមួយចេញពីហោប៉ៅ។ តូច ហើយចាស់ ពីពានរង្វាន់បឋមសិក្សា កាលពីយូរមកហើយ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'My grandfather told me to give this to the next child who needs a dream.',
      km: 'ជីតារបស់បងប្រាប់ឲ្យយកវាទៅឲ្យក្មេងបន្ទាប់ ដែលត្រូវការក្ដីស្រមៃ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Keep training. Every day. One day, it will be you.',
      km: 'បន្តហ្វឹកហាត់។ រាល់ថ្ងៃ។ ថ្ងៃណាមួយ នឹងដល់វេនប្អូន។',
    }),
    // the moral and THE END come next on the closing card (src/data/story/closing.js)
  ]),
};
