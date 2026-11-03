import { narrate, say, scene } from '../script.js';

export const TRAINING_SCENES = {
  'ch1-dribble-before': scene('school-yard', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: 'First lesson: the ball is a friend. Keep it close, like a shy puppy.',
      km: 'មេរៀនទីមួយ៖ បាល់ជាមិត្ត។ ទុកវាឲ្យនៅជិត ដូចកូនឆ្កែដែលខ្មាសគេ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'Weave through the cones. Touch none of them. Fast, but never careless.',
      km: 'នាំបាល់បត់ចុះឡើងកាត់កោន។ កុំប៉ះមួយណាសោះ។ លឿន តែកុំធ្វេសប្រហែស។',
    }),
    say('dara', 'smirk', 'right', {
      en: "Those aren't cones, Teacher. Those are my mother's cooking pots.",
      km: 'នោះមិនមែនកោនទេ លោកគ្រូ។ នោះឆ្នាំងម៉ែខ្ញុំ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: "Then don't knock any over, or your mother will scold us both.",
      km: 'អញ្ចឹងកុំទាត់រលំ បើមិនអញ្ចឹងទេ ម៉ែឯងស្ដីឲ្យយើងទាំងពីរនាក់ហើយ។',
    }),
  ]),

  'ch1-dribble-after': scene('school-yard', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: 'Good! The ball listens to you. Now we teach your friends to listen too.',
      km: 'ល្អណាស់! បាល់ស្ដាប់ក្មួយ។ ឥឡូវយើងបង្រៀនមិត្តក្មួយឲ្យស្ដាប់ដែរ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'On Sunday we play Svay Village. A friendly. Our first match as a team.',
      km: 'ថ្ងៃអាទិត្យនេះ យើងប្រកួតមិត្តភាពជាមួយភូមិស្វាយ។ ការប្រកួតដំបូងរបស់យើងជាក្រុម។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'A real match! Dara, did you hear?',
      km: 'ប្រកួតពិតៗ! ដារ៉ា ឮទេ?',
    }),
    say('dara', 'happy', 'right', {
      en: "I heard. I'm already nervous. Is it normal to get hungry when you're nervous?",
      km: 'ឮហើយ។ ខ្ញុំភ័យហើយ។ ភ័យហើយឃ្លានបាយ ធម្មតាទេ?',
    }),
  ]),

  'ch1-shot-before': scene('school-yard', 'hope', [
    say('coach-vannak', 'neutral', 'right', {
      en: 'Speed gets you to the goal. Only aim puts the ball in it.',
      km: 'ល្បឿននាំឲ្យដល់ទី។ មានតែការតម្រង់ទេ ដែលធ្វើឲ្យបាល់ចូលទី។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'I hung tin cans in the corners of the bamboo goal. Knock them down.',
      km: 'គ្រូព្យួរកំប៉ុងនៅជ្រុងទីឫស្សី។ ទាត់ឲ្យវាធ្លាក់។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'And I stand in goal while he shoots at tin cans? Right next to my head?',
      km: 'ហើយខ្ញុំឈរចាំទី ពេលវាទាត់កំប៉ុង? នៅជិតក្បាលខ្ញុំអញ្ចឹង?',
    }),
    say('sochetra', 'smirk', 'left', {
      en: "Don't worry. I never miss.",
      km: 'កុំបារម្ភ។ ខ្ញុំមិនដែលទាត់ខុសទេ។',
    }),
    say('dara', 'sad', 'right', {
      en: 'Yesterday you missed a whole cow.',
      km: 'ម្សិលមិញ ឯងទាត់ខុសគោមួយក្បាលទាំងមូល។',
    }),
  ]),

  'ch1-shot-after': scene('school-yard', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: 'Clang, clang, clang! The whole village heard that.',
      km: 'គ្រាំង គ្រាំង គ្រាំង! អ្នកភូមិទាំងមូលឮហើយ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Tomorrow we ride to the provincial ground. Riverside School is waiting.',
      km: 'ថ្ងៃស្អែក យើងជិះទៅទីលានខេត្ត។ សាលាមាត់ទន្លេកំពុងរង់ចាំ។',
    }),
  ]),

  'ch1-river-before': scene('village-dusk', 'calm', [
    narrate({
      en: 'The evening before the trip to Phnom Penh, Ta Sok takes Sochetra down to the river.',
      km: 'ល្ងាចមុនថ្ងៃធ្វើដំណើរទៅភ្នំពេញ តាសុខនាំសុចិត្រាចុះទៅមាត់ទន្លេ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Close your eyes. Hear the water? It never hurries, and it never stops.',
      km: 'បិទភ្នែក។ ឮសំឡេងទឹកទេ? វាមិនដែលប្រញាប់ ហើយក៏មិនដែលឈប់ដែរ។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Breathe with it. When your heart is quiet, you will feel the moment to strike.',
      km: 'ដកដង្ហើមតាមវា។ ពេលចិត្តចៅស្ងប់ ចៅនឹងដឹងថាពេលណាត្រូវទាត់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Like the Naga under the water, waiting.',
      km: 'ដូចនាគនៅក្រោមទឹក ដែលកំពុងរង់ចាំ។',
    }),
  ]),

  'ch1-river-after': scene('village-dusk', 'hope', [
    say('ta-sok', 'happy', 'right', {
      en: 'Good. Your breath is slow now, and your eyes are sharp.',
      km: 'ល្អ។ ដង្ហើមចៅយឺតហើយ ភ្នែកចៅក៏មុតហើយ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Take my krama. I wore it in every match I ever played. It knows the way.',
      km: 'យកក្រមារបស់តាទៅ។ តាពាក់វាគ្រប់ការប្រកួតដែលតាធ្លាប់លេង។ វាស្គាល់ផ្លូវ។',
    }),
    say('sochetra', 'cry', 'left', {
      en: "Ta... I'll bring it back with a trophy.",
      km: 'លោកតា... ចៅនឹងយកវាមកវិញ ជាមួយពានរង្វាន់។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "Bring it back with a smile. That's enough for me.",
      km: 'យកវាមកវិញជាមួយស្នាមញញឹម។ ប៉ុណ្ណឹងគ្រប់គ្រាន់សម្រាប់តាហើយ។',
    }),
  ]),
};
