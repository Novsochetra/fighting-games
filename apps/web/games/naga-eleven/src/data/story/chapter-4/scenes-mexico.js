import { narrate, say, scene } from '../script.js';

export const MEXICO_SCENES = {
  'ch4-mexico-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Group match three. Mexico, whose fans sing for ninety minutes without a break.',
      km: 'ការប្រកួតពូលទីបី។ ម៉ិកស៊ិក ដែលអ្នកគាំទ្ររបស់គេច្រៀងកៅសិបនាទីមិនឈប់។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'They play with heart, like us. So it comes down to who wants it more.',
      km: 'គេលេងដោយបេះដូង ដូចយើង។ អញ្ចឹង វាអាស្រ័យលើអ្នកណាចង់បានជាង។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Their fans are amazing. Can we keep some?',
      km: 'អ្នកគាំទ្ររបស់គេអស្ចារ្យណាស់។ យើងសុំខ្លះបានទេ?',
    }),
  ]),

  'ch4-mexico-win': scene('stadium-tunnel', 'hope', [
    say('announcer', 'happy', 'right', {
      en: 'Cambodia win! The Mexican fans are applauding them off the pitch!',
      km: 'កម្ពុជាឈ្នះ! អ្នកគាំទ្រម៉ិកស៊ិកទះដៃអបអរពួកគេ ពេលចាកចេញពីទីលាន!',
    }),
    say('rithy', 'happy', 'right', {
      en: "Even their fans sing for us. That's how you know you've done something.",
      km: 'សូម្បីអ្នកគាំទ្រគេក៏ច្រៀងឲ្យយើង។ នោះហើយទើបដឹងថាយើងធ្វើបានអ្វីមួយ។',
    }),
  ]),

  'ch4-mexico-lose': scene('dressing-room', 'sad', [
    say('coach-bora', 'neutral', 'right', {
      en: "Now we wait for the table. Whatever it says, you've made the country proud.",
      km: 'ឥឡូវយើងរង់ចាំតារាងពិន្ទុ។ ទោះវាថាយ៉ាងណា ឯងបានធ្វើឲ្យប្រទេសមានមោទនភាព។',
    }),
    say('sochetra', 'sad', 'left', {
      en: 'Proud is not enough. Not this time.',
      km: 'មោទនភាពមិនទាន់គ្រប់គ្រាន់ទេ។ មិនមែនលើកនេះទេ។',
    }),
  ]),

  'ch4-mexico-draw': scene('stadium-tunnel', 'calm', [
    say('coach-bora', 'neutral', 'right', {
      en: 'A draw. Now the table decides.',
      km: 'ស្មើ។ ឥឡូវតារាងពិន្ទុជាអ្នកសម្រេច។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Whatever it says, we're not done dreaming.",
      km: 'ទោះវាថាយ៉ាងណា យើងមិនទាន់ឈប់ស្រមៃទេ។',
    }),
  ]),

  'ch4-group-fail': scene('dressing-room', 'sad', [
    narrate({
      en: 'Third in the group. The World Championship ends here for Cambodia.',
      km: 'លេខរៀងទីបីក្នុងពូល។ ការប្រកួតជើងឯកពិភពលោកបញ្ចប់ត្រឹមនេះសម្រាប់កម្ពុជា។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'No. Not like this. Forty kids are waiting.',
      km: 'ទេ។ មិនមែនបែបនេះទេ។ ក្មេងសែសិបនាក់កំពុងរង់ចាំ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Then we go again, from the first match. We don't stop until they're proud.",
      km: 'អញ្ចឹងយើងលេងម្ដងទៀត ចាប់ពីការប្រកួតទីមួយ។ យើងមិនឈប់ទេ រហូតដល់ពួកគេមានមោទនភាព។',
    }),
  ]),
};
