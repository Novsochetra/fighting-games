import { narrate, say, scene, villager } from '../script.js';

const FAN = { name: { en: 'Chrey fan', km: 'អ្នកគាំទ្រជ្រៃ' }, age: 'adult' };

export const FRIENDLY_SCENES = {
  'ch1-friendly-before': scene('village-dawn', 'hope', [
    narrate({
      en: 'Sunday. Half of Chrey sits on the fence. The other half sits in the trees.',
      km: 'ថ្ងៃអាទិត្យ។ អ្នកភូមិជ្រៃពាក់កណ្ដាលអង្គុយលើរបង។ ពាក់កណ្ដាលទៀតអង្គុយលើដើមឈើ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: "Seven of us, seven of them. Pass, move, and help each other. That's all.",
      km: 'យើងប្រាំពីរនាក់ គេប្រាំពីរនាក់។ ហុចបាល់ រត់រកកន្លែងទំនេរ ហើយជួយគ្នា។ ប៉ុណ្ណឹងឯង។',
    }),
    villager(FAN, {
      en: 'Go, Chrey! Sochetra, run like a chicken again!',
      km: 'ជយោ ភូមិជ្រៃ! សុចិត្រា រត់បែបមាន់ម្ដងទៀតមើល!',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Ta Sok came too! He is waving his krama like a flag!',
      km: 'លោកតាមកដែរ! គាត់គ្រវីក្រមាដូចទង់ជាតិ!',
    }),
  ]),

  'ch1-friendly-kickoff': scene('black', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: 'PASS finds a friend. Look for the one standing in space.',
      km: 'ចុច PASS ដើម្បីហុចបាល់ទៅមិត្ត។ រកអ្នកដែលឈរនៅកន្លែងទំនេរ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'Tap PASS for a pass along the ground. Hold PASS for a long ball in the air to a friend far away.',
      km: 'ចុច PASS ម្ដង ដើម្បីហុចបាល់តាមដី។ សង្កត់ PASS ដើម្បីទាត់បាល់ខ្ពស់ ទៅមិត្តដែលនៅឆ្ងាយ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Hold SHOOT to charge, let go to strike. Up or down picks the corner.',
      km: 'សង្កត់ SHOOT ដើម្បីប្រមូលកម្លាំង លែងវិញដើម្បីទាត់។ ចុចឡើងលើ ឬចុះក្រោម ដើម្បីរើសជ្រុង។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Quick passes build a COMBO. Watch the count: x2, x3!',
      km: 'ហុចបាល់លឿនៗ បង្កើតបានខមបូ។ មើលលេខរាប់៖ x2, x3!',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'Every good pass, tackle and save fills your spirit.',
      km: 'រាល់ការហុចល្អ ការដណ្ដើមបាល់ និងការរាំងបាល់ ធ្វើឲ្យស្មារតីកើនឡើង។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Hold RUN to sprint. Now go, and enjoy it!',
      km: 'សង្កត់ RUN ដើម្បីរត់លឿន។ ទៅ ហើយលេងឲ្យសប្បាយ!',
    }),
  ]),

  'ch1-friendly-defend': scene('black', 'hope', [
    say('coach-vannak', 'determined', 'right', {
      en: 'When they have the ball, SHOOT slides in to win it back.',
      km: 'ពេលគេមានបាល់ ចុច SHOOT ដើម្បីរអិលដណ្ដើមបាល់មកវិញ។',
    }),
    say('coach-vannak', 'neutral', 'right', {
      en: 'And PASS jumps you to the friend nearest the ball.',
      km: 'ហើយចុច PASS ដើម្បីប្ដូរទៅមិត្តដែលនៅជិតបាល់ជាងគេ។',
    }),
  ]),

  'ch1-friendly-combo': scene('black', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: 'Three passes! The ball runs like the Mekong. Hold SHOOT, let go: Mekong Current!',
      km: 'ហុចបីដងហើយ! បាល់រត់ដូចទឹកទន្លេមេគង្គ។ សង្កត់ SHOOT ហើយលែង៖ ចរន្តមេគង្គ!',
    }),
    say('dara', 'happy', 'right', {
      en: 'I passed it too! Does that count? It counts!',
      km: 'ខ្ញុំក៏បានហុចដែរ! រាប់ដែរទេ? រាប់ហើយ!',
    }),
  ]),

  'ch1-friendly-first-goal': scene('black', 'triumph', [
    villager(FAN, {
      en: 'GOAL! Chrey scored! Go and tell the whole market!',
      km: 'ចូលហើយ! ជ្រៃស៊ុតចូលហើយ! ទៅប្រាប់អ្នកផ្សារទាំងអស់មក!',
    }),
    say('dara', 'happy', 'right', {
      en: "Did you see that? I didn't. I had my eyes closed!",
      km: 'ឃើញទេ? ខ្ញុំមិនឃើញទេ។ ខ្ញុំបិទភ្នែក!',
    }),
  ]),

  'ch1-friendly-win': scene('village-dusk', 'hope', [
    say('coach-vannak', 'happy', 'right', {
      en: "Our first win as a team! You passed, you helped each other. That's football.",
      km: 'ជ័យជម្នះដំបូងរបស់យើងជាក្រុម! ក្មួយៗហុចបាល់ ជួយគ្នា។ នោះហើយជាបាល់ទាត់។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Teacher, is it true? The cup? The real one?',
      km: 'លោកគ្រូ ពិតមែនឬ? ពានរង្វាន់នោះ? ពិតៗមែន?',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'First the Kampong Cham semi-final. Then, if we win, Phnom Penh.',
      km: 'ដំបូង វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនៅកំពង់ចាម។ បើឈ្នះ ទៅភ្នំពេញ។',
    }),
    say('dara', 'shocked', 'right', {
      en: "Phnom Penh! I've never even seen a traffic light!",
      km: 'ភ្នំពេញ! ខ្ញុំមិនដែលឃើញភ្លើងស្តុបផង!',
    }),
  ]),

  'ch1-friendly-lose': scene('village-dusk', 'calm', [
    say('coach-vannak', 'neutral', 'right', {
      en: "We lost. That's all right. Now we know what to fix.",
      km: 'យើងចាញ់។ មិនអីទេ។ ឥឡូវយើងដឹងថាត្រូវកែអ្វីខ្លះ។',
    }),
    say('sochetra', 'sad', 'left', {
      en: 'I tried to beat them all by myself.',
      km: 'ខ្ញុំព្យាយាមនាំបាល់កាត់គេទាំងអស់តែម្នាក់ឯង។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Then next time, look up. Your friends are there for a reason.',
      km: 'អញ្ចឹងលើកក្រោយ ងើបមុខមើល។ មិត្តក្មួយនៅទីនោះ គឺមានហេតុផល។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'I lost my first match eight to nothing. Look at me now. Still alive!',
      km: 'ការប្រកួតដំបូងរបស់តា តាចាញ់ប្រាំបីទល់សូន្យ។ មើលតាឥឡូវ នៅរស់ដដែល!',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Next comes the Kampong Cham semi-final. We train, and we grow.',
      km: 'បន្ទាប់មក វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនៅកំពង់ចាម។ យើងហ្វឹកហាត់ ហើយរីកចម្រើន។',
    }),
  ]),

  'ch1-friendly-draw': scene('village-dusk', 'calm', [
    say('coach-vannak', 'happy', 'right', {
      en: "A draw with a team that's played for years. Not bad for a first match.",
      km: 'ស្មើជាមួយក្រុមដែលលេងច្រើនឆ្នាំមកហើយ។ មិនអាក្រក់ទេសម្រាប់ការប្រកួតដំបូង។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Nobody lost! That means everybody won. Right? Right?',
      km: 'គ្មាននរណាចាញ់! មានន័យថា គ្រប់គ្នាឈ្នះ។ មែនទេ? មែនទេ?',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Next time we win. Properly.',
      km: 'លើកក្រោយយើងត្រូវឈ្នះ។ ឈ្នះឲ្យពិតប្រាកដ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Next comes the Kampong Cham semi-final. The real cup starts now.',
      km: 'បន្ទាប់មក វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រនៅកំពង់ចាម។ ពានពិតប្រាកដចាប់ផ្ដើមឥឡូវហើយ។',
    }),
  ]),
};
