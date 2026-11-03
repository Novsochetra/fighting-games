import { narrate, say, scene } from '../script.js';

export const KOREA_SCENES = {
  'ch3-korea-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'Group match three. Korea, and the engine of their midfield: Minjun.',
      km: 'ការប្រកួតពូលទីបី។ កូរ៉េ និងម៉ាស៊ីននៅខ្សែកណ្ដាលរបស់គេ៖ មីនជុន។',
    }),
    say('minjun', 'determined', 'right', {
      en: 'I will run until you cannot. Then I will keep running.',
      km: 'ខ្ញុំនឹងរត់ រហូតដល់អ្នករត់លែងរួច។ ហើយខ្ញុំនៅតែបន្តរត់។',
    }),
    say('minjun', 'neutral', 'right', {
      en: 'My lungs do not know the word "tired".',
      km: 'សួតរបស់ខ្ញុំមិនស្គាល់ពាក្យថា «ហត់» ទេ។',
    }),
    say('dara', 'shocked', 'right', {
      en: 'Mine know it very well. They say it all the time.',
      km: 'សួតខ្ញុំស្គាល់ច្បាស់ណាស់។ វានិយាយវារហូត។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Don't race him. Move the ball faster than he can run.",
      km: 'កុំប្រណាំងរត់ជាមួយគេ។ បង្វិលបាល់ឲ្យលឿនជាងគេរត់។',
    }),
  ]),

  'ch3-korea-duel': scene('black', 'tense', [
    say('minjun', 'determined', 'right', {
      en: 'The Hwarang never retreat! Out of my way!',
      km: 'ហ្វារ៉ាំងមិនដែលដកថយទេ! ចេញពីផ្លូវខ្ញុំ!',
    }),
    say('sochetra', 'determined', 'left', { en: 'Not a chance!', km: 'មិនងាយទេ!' }),
  ]),

  'ch3-korea-win': scene('stadium-tunnel', 'hope', [
    say('minjun', 'sad', 'right', {
      en: 'My legs... are tired. For the first time in my life.',
      km: 'ជើងខ្ញុំ... ហត់ហើយ។ ជាលើកដំបូងក្នុងជីវិតខ្ញុំ។',
    }),
    say('minjun', 'happy', 'right', {
      en: 'Go far, Cambodia. Make my tired legs worth it.',
      km: 'ទៅឲ្យឆ្ងាយ កម្ពុជា។ ធ្វើឲ្យជើងហត់របស់ខ្ញុំមានតម្លៃ។',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'We will. Thank you, Minjun.',
      km: 'យើងនឹងធ្វើ។ អរគុណ មីនជុន។',
    }),
  ]),

  'ch3-korea-lose': scene('dressing-room', 'sad', [
    say('minjun', 'neutral', 'right', {
      en: 'You ran well. But you stopped one second before me. Always one second.',
      km: 'អ្នករត់បានល្អ។ ប៉ុន្តែអ្នកឈប់មុនខ្ញុំមួយវិនាទី។ តែងតែមួយវិនាទី។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "Now the table decides. Whatever it says, I'm proud of how you fought.",
      km: 'ឥឡូវតារាងពិន្ទុជាអ្នកសម្រេច។ ទោះវាថាយ៉ាងណា ខ្ញុំមានមោទនភាពនឹងរបៀបដែលឯងតស៊ូ។',
    }),
  ]),

  'ch3-korea-draw': scene('stadium-tunnel', 'calm', [
    say('minjun', 'neutral', 'right', {
      en: 'A draw. My legs say we should play again. My coach says no.',
      km: 'ស្មើ។ ជើងខ្ញុំថាគួរលេងម្ដងទៀត។ គ្រូបង្វឹកខ្ញុំថាអត់។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Now we see where the table puts us.',
      km: 'ឥឡូវយើងមើលថាតារាងពិន្ទុដាក់យើងនៅត្រង់ណា។',
    }),
  ]),

  'ch3-group-fail': scene('dressing-room', 'sad', [
    narrate({
      en: "Third in the group. Cambodia's Asian dream ends early.",
      km: 'លេខរៀងទីបីក្នុងពូល។ ក្ដីស្រមៃអាស៊ីរបស់កម្ពុជាបញ្ចប់មុនពេល។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'No. It ends when we say it ends. We train, and we play this group again.',
      km: 'ទេ។ វាបញ្ចប់នៅពេលយើងថាវាបញ្ចប់។ យើងហ្វឹកហាត់ ហើយលេងពូលនេះម្ដងទៀត។',
    }),
    say('rithy', 'determined', 'right', {
      en: 'Together this time. From the first match.',
      km: 'លើកនេះជាមួយគ្នា។ ចាប់ពីការប្រកួតទីមួយ។',
    }),
  ]),
};
