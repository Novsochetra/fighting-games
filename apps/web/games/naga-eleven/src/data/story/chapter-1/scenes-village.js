import { narrate, say, scene } from '../script.js';

export const VILLAGE_SCENES = {
  'ch1-opening': scene('black', 'calm', [
    narrate({
      en: 'Some stories begin in great stadiums. This one begins in the mud.',
      km: 'រឿងខ្លះចាប់ផ្ដើមនៅកីឡដ្ឋានដ៏ធំ។ រឿងនេះចាប់ផ្ដើមនៅក្នុងភក់។',
    }),
    narrate({
      en: 'Kampong Cham province, where the Mekong runs wide and brown and slow.',
      km: 'ខេត្តកំពង់ចាម ជាកន្លែងដែលទន្លេមេគង្គហូរធំទូលាយ ពណ៌ត្នោត និងយឺតៗ។',
    }),
    narrate({
      en: 'In Chrey village, between the rice paddies and the sugar palms, lives a boy with a gift.',
      km: 'នៅភូមិជ្រៃ ចន្លោះវាលស្រែ និងដើមត្នោត មានក្មេងប្រុសម្នាក់ដែលមានទេពកោសល្យ។',
    }),
    narrate({
      en: 'His name is Sochetra. He is eleven years old, and he has never owned a new ball.',
      km: 'គេឈ្មោះ សុចិត្រា។ គេអាយុដប់មួយឆ្នាំ ហើយមិនដែលមានបាល់ថ្មីមួយសោះ។',
    }),
  ]),

  'ch1-market': scene('village-dawn', 'calm', [
    say('neary', 'happy', 'right', {
      en: "Sochetra! The num banh chok won't walk to the market by itself!",
      km: 'សុចិត្រា! នំបញ្ចុកមិនចេះដើរទៅផ្សារខ្លួនឯងទេ កូន!',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Coming, Mae! I can carry the basket and the ball at the same time.',
      km: 'បាទ ម៉ែ! កូនអាចយួរកន្ត្រក ហើយលេងបាល់ព្រមគ្នាបាន។',
    }),
    narrate({
      en: 'Knee, knee, foot. The old patched ball never touches the ground. Not one noodle spills.',
      km: 'ជង្គង់ ជង្គង់ ជើង។ បាល់ចាស់ដែលប៉ះហើយប៉ះទៀតមិនធ្លាក់ដល់ដីសោះ។ នំបញ្ចុកមិនកំពប់មួយសរសៃ។',
    }),
    say('dara', 'happy', 'right', {
      en: "One day you'll drop it all, and your mother will make YOU into num banh chok.",
      km: 'ថ្ងៃណាមួយ ឯងនឹងធ្វើធ្លាក់ទាំងអស់ ហើយម៉ែឯងនឹងយកឯងធ្វើនំបញ្ចុកវិញ។',
    }),
    say('sochetra', 'smirk', 'left', {
      en: "Then I'll be the fastest num banh chok in Kampong Cham.",
      km: 'អញ្ចឹង ខ្ញុំនឹងក្លាយជានំបញ្ចុកដែលលឿនជាងគេនៅកំពង់ចាម។',
    }),
    say('neary', 'happy', 'right', {
      en: "Eat first, both of you. Champions don't play hungry.",
      km: 'ញ៉ាំបាយសិនទាំងពីរនាក់។ ជើងឯកមិនលេងទាំងពោះទទេទេ។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'Champions! Did you hear that? Your mother called us champions!',
      km: 'ជើងឯក! ឮទេ? ម៉ែឯងហៅយើងថាជើងឯក!',
    }),
  ]),

  'ch1-legend': scene('home-night', 'calm', [
    narrate({
      en: 'That night the lamp flickers, and Ta Sok, his grandfather, ties on his red-and-white krama.',
      km: 'យប់នោះ ចង្កៀងភ្លឹបភ្លែតៗ ហើយតាសុខ ជីតារបស់គេ ចងក្រមាក្រហមសរបស់គាត់។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Come, grandchild. Sit. Do you know why our people say we are children of the Naga?',
      km: 'មកនេះ ចៅ។ អង្គុយសិន។ ចៅដឹងទេ ហេតុអ្វីបានជាខ្មែរយើងថា យើងជាកូនចៅនាគ?',
    }),
    say('sochetra', 'neutral', 'left', {
      en: 'Because of Preah Thong and Neang Neak?',
      km: 'មកពីរឿងព្រះថោង នាងនាគ មែនទេ លោកតា?',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'Yes. The prince loved the Naga princess, and her father drank the sea to give them land.',
      km: 'មែនហើយ។ ព្រះថោងស្រឡាញ់នាងនាគ ហើយស្ដេចនាគបានផឹកទឹកសមុទ្រ ដើម្បីបង្កើតដីឲ្យពួកគេរស់នៅ។',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'That land is Cambodia. And the Naga never left. It sleeps under the Mekong.',
      km: 'ដីនោះគឺកម្ពុជា។ ហើយនាគមិនដែលចាកចេញទេ។ វាដេកលក់នៅក្រោមទន្លេមេគង្គ។',
    }),
    say('sochetra', 'shocked', 'left', {
      en: 'Under OUR river? Right there, past the sugar palms?',
      km: 'នៅក្រោមទន្លេយើងនេះ? ត្រង់នោះ ហួសដើមត្នោតនោះឬ?',
    }),
    say('ta-sok', 'happy', 'right', {
      en: 'When I kept goal for Chrey, long ago, I felt it behind me, as if the whole river had my back.',
      km: 'កាលតានៅក្មេង តាចាំទីឲ្យភូមិជ្រៃ។ តាមានអារម្មណ៍ថាវានៅពីក្រោយខ្នងតា ដូចជាទន្លេទាំងមូលការពារតា។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Will the Naga ever wake for me, Ta?',
      km: 'តើនាគនឹងភ្ញាក់ឡើងសម្រាប់ចៅដែរទេ លោកតា?',
    }),
    say('ta-sok', 'neutral', 'right', {
      en: 'Not when you want it. When you need it, and only if you play for others, not for yourself.',
      km: 'មិនមែនពេលចៅចង់បានទេ។ គឺពេលចៅត្រូវការវា ហើយលុះត្រាតែចៅលេងដើម្បីអ្នកដទៃ មិនមែនដើម្បីខ្លួនឯង។',
    }),
    say('ta-sok', 'happy', 'right', {
      en: "Now sleep. The Naga doesn't wake for boys who stay up late.",
      km: 'ឥឡូវគេងទៅ។ នាគមិនភ្ញាក់សម្រាប់ក្មេងដែលគេងយប់ជ្រៅទេ។',
    }),
  ]),

  'ch1-coach': scene('school-yard', 'hope', [
    narrate({
      en: "At Chrey School the big boys never let the small ones play. Today, Sochetra doesn't ask.",
      km: 'នៅសាលាជ្រៃ ក្មេងធំៗមិនដែលឲ្យក្មេងតូចៗលេងទេ។ ថ្ងៃនេះ សុចិត្រាមិនសុំទេ។',
    }),
    narrate({
      en: 'He takes the ball and goes past one, two, three of them, like water around stones.',
      km: 'គេយកបាល់ ហើយនាំកាត់ម្នាក់ ពីរនាក់ បីនាក់ ដូចទឹកហូរជុំវិញថ្ម។',
    }),
    say('coach-vannak', 'shocked', 'right', {
      en: 'Hey! You! Who taught you to move like that?',
      km: 'ហេ! ក្មួយ! អ្នកណាបង្រៀនក្មួយឲ្យរត់បែបនេះ?',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'The chickens, Teacher. They never run in a straight line.',
      km: 'មាន់ បាទលោកគ្រូ។ វាមិនដែលរត់ត្រង់ទេ។',
    }),
    say('coach-vannak', 'happy', 'right', {
      en: 'Ha! Then the chickens are better coaches than I am.',
      km: 'ហាហា! អញ្ចឹងមាន់ជាគ្រូបង្វឹកពូកែជាងគ្រូទៅទៀត។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'Listen. This year, Chrey School will play in the National Primary Schools Cup.',
      km: 'ស្ដាប់គ្រូ។ ឆ្នាំនេះ សាលាជ្រៃនឹងចូលរួមពានរង្វាន់បាល់ទាត់បឋមសិក្សាថ្នាក់ជាតិ។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'Us? Teacher, our goals are made of bamboo. Our nets are old fishing nets!',
      km: 'យើងឬ លោកគ្រូ? ទីយើងធ្វើពីឫស្សី។ សំណាញ់ក៏ជាអួនចាស់ទៀត!',
    }),
    say('coach-vannak', 'sad', 'right', {
      en: 'At your age I was picked for the province once. My family needed me in the fields. I never went.',
      km: 'កាលគ្រូអាយុប៉ុនក្មួយ គេជ្រើសគ្រូទៅលេងឲ្យខេត្តម្ដង។ តែគ្រួសារត្រូវការគ្រូនៅស្រែ គ្រូមិនបានទៅ។',
    }),
    say('coach-vannak', 'determined', 'right', {
      en: 'A gift is a seed. It needs water every day. Will you work, Sochetra?',
      km: 'ទេពកោសល្យដូចជាគ្រាប់ពូជ។ វាត្រូវការទឹករាល់ថ្ងៃ។ ក្មួយព្រមខំប្រឹងទេ សុចិត្រា?',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Every day, Teacher. I promise.',
      km: 'រាល់ថ្ងៃ បាទលោកគ្រូ។ ខ្ញុំសន្យា។',
    }),
  ]),
};
