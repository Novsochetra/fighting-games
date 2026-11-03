import { narrate, say, scene } from '../script.js';

export const SEMI_SCENES = {
  'ch2-sokha-story': scene('village-dusk', 'calm', [
    narrate({
      en: 'That evening, Coach Sokha finds Sochetra sitting alone by the river.',
      km: 'ល្ងាចនោះ លោកគ្រូសុខាឃើញសុចិត្រាអង្គុយម្នាក់ឯងនៅមាត់ទន្លេ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: "I was like you once. The fastest boy in Kampong Cham. Everyone said I'd play for the country.",
      km: 'ខ្ញុំធ្លាប់ដូចឯង។ ក្មេងលឿនជាងគេនៅកំពង់ចាម។ គ្រប់គ្នាថាខ្ញុំនឹងបានលេងឲ្យជាតិ។',
    }),
    say('coach-sokha', 'sad', 'right', {
      en: 'So I stopped training. I believed them. By eighteen, the slower boys who worked had passed me.',
      km: 'ដូច្នេះខ្ញុំឈប់ហ្វឹកហាត់។ ខ្ញុំជឿគេ។ ដល់អាយុដប់ប្រាំបី ក្មេងយឺតៗដែលខំប្រឹង បានហួសខ្ញុំអស់ហើយ។',
    }),
    say('sochetra', 'shocked', 'left', { en: 'Coach...', km: 'លោកគ្រូ...' }),
    say('coach-sokha', 'determined', 'right', {
      en: "I'm hard on you because I won't watch it happen twice. Not to you.",
      km: 'ខ្ញុំតឹងរ៉ឹងជាមួយឯង ព្រោះខ្ញុំមិនចង់ឃើញរឿងនេះកើតឡើងពីរដងទេ។ ជាពិសេសចំពោះឯង។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Then don't go easy on me. Not ever.",
      km: 'អញ្ចឹង កុំបន្ធូរដៃជាមួយខ្ញុំ។ កុំឲ្យសោះ។',
    }),
    say('coach-sokha', 'happy', 'right', { en: 'I never do.', km: 'ខ្ញុំមិនដែលបន្ធូរទេ។' }),
  ]),

  'ch2-focus-before': scene('temple-dawn', 'calm', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'Kampot plays tight and waits for one mistake. Patience beats them.',
      km: 'កំពតលេងតឹង ហើយរង់ចាំកំហុសមួយ។ មានតែការអត់ធ្មត់ទេទើបឈ្នះគេ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Ta Sok taught me this one. Breathe like the river.',
      km: 'លោកតាសុខបង្រៀនខ្ញុំរឿងនេះ។ ដកដង្ហើមដូចទន្លេ។',
    }),
  ]),

  'ch2-focus-after': scene('temple-dawn', 'hope', [
    say('coach-sokha', 'neutral', 'right', {
      en: 'Your grandfather is a wise man. Listen to him more than to the crowd.',
      km: 'ជីតាឯងជាមនុស្សមានប្រាជ្ញា។ ស្ដាប់គាត់ឲ្យច្រើនជាងស្ដាប់ហ្វូងមនុស្ស។',
    }),
    say('dara', 'happy', 'right', {
      en: 'Kampot! Their pepper crab is famous. If we win, we eat crab.',
      km: 'កំពត! ក្ដាមឆាម្រេចរបស់គេល្បីណាស់។ បើឈ្នះ យើងញ៉ាំក្ដាម។',
    }),
  ]),

  'ch2-semi-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The semi-final, in Phnom Penh. Kampot High have not let in a goal all season.',
      km: 'វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រ នៅភ្នំពេញ។ វិទ្យាល័យកំពតមិនទាន់ឲ្យគេស៊ុតចូលសូម្បីមួយគ្រាប់ពេញមួយរដូវ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Be patient. Move the ball. The door will open. When it does, walk through.',
      km: 'អត់ធ្មត់។ បង្វិលបាល់។ ទ្វារនឹងបើក។ ពេលវាបើក ដើរចូលទៅ។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Tola, float the Kite Cross. Sochetra, meet it with your head.',
      km: 'តុលា បញ្ជូនបាល់ខ្លែងឲ្យអណ្ដែតមក។ សុចិត្រា បុកក្បាលវា។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Two players, one goal: the Kite Header.',
      km: 'កីឡាករពីរនាក់ គ្រាប់បាល់តែមួយ៖ បុកក្បាលខ្លែង។',
    }),
    narrate({
      en: 'Kite Header: from a wing, hold PASS to full to Sochetra, then SHOOT as it comes.',
      km: 'បុកក្បាលខ្លែង៖ ពីស្លាប សង្កត់ PASS ឲ្យពេញទៅសុចិត្រា រួចចុច SHOOT ពេលបាល់មកដល់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Rithy's team is in the other semi. If we win, it's him in the final.",
      km: 'ក្រុមរិទ្ធីនៅវគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រមួយទៀត។ បើយើងឈ្នះ យើងជួបគេនៅវគ្គផ្ដាច់ព្រ័ត្រ។',
    }),
    say('dara', 'smirk', 'right', {
      en: 'Four years, and you still say his name like it tastes bad.',
      km: 'បួនឆ្នាំហើយ ឯងនៅតែហៅឈ្មោះគេដូចវាល្វីងមាត់។',
    }),
  ]),

  'ch2-semi-kite': scene('black', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: 'KITE HEADER! Tola floats it, Sochetra rises!',
      km: 'បុកក្បាលខ្លែង! តុលាបញ្ជូនបាល់អណ្ដែតមក សុចិត្រាហោះឡើង!',
    }),
  ]),

  'ch2-semi-win': scene('stadium-tunnel', 'triumph', [
    say('announcer', 'happy', 'right', {
      en: 'Kampong Cham High are through to the final!',
      km: 'វិទ្យាល័យកំពង់ចាម ឡើងដល់វគ្គផ្ដាច់ព្រ័ត្រហើយ!',
    }),
    say('announcer', 'neutral', 'right', {
      en: 'And watching from the stand: Coach Bora, of the national youth team.',
      km: 'ហើយអ្នកដែលកំពុងមើលពីលើកន្លែងអង្គុយ៖ លោកគ្រូបូរ៉ា នៃក្រុមជម្រើសជាតិយុវជន។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: "So that's the boy from Chrey. Let's see what he does against the best.",
      km: 'អញ្ចឹង នេះហើយក្មេងមកពីជ្រៃ។ តោះមើលថាគេធ្វើអ្វីបាន ពេលជួបក្រុមខ្លាំងបំផុត។',
    }),
    say('dara', 'happy', 'right', {
      en: "Crab! We're eating crab!",
      km: 'ក្ដាម! យើងបានញ៉ាំក្ដាមហើយ!',
    }),
  ]),

  'ch2-semi-lose': scene('dressing-room', 'sad', [
    say('sochetra', 'sad', 'left', {
      en: 'We pushed and pushed, and the door never opened.',
      km: 'យើងរុញ ហើយរុញ តែទ្វារមិនដែលបើកសោះ។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Then we knock harder. Back to training, and we play them again.',
      km: 'អញ្ចឹងយើងគោះឲ្យខ្លាំងជាងនេះ។ ត្រឡប់ទៅហ្វឹកហាត់ ហើយយើងលេងជាមួយគេម្ដងទៀត។',
    }),
    say('dara', 'sad', 'right', { en: 'No crab tonight.', km: 'យប់នេះគ្មានក្ដាមទេ។' }),
  ]),

  'ch2-rival': scene('city-street', 'tense', [
    narrate({
      en: 'The night before the final, a voice Sochetra knows.',
      km: 'យប់មុនវគ្គផ្ដាច់ព្រ័ត្រ មានសំឡេងមួយដែលសុចិត្រាធ្លាប់ស្គាល់។',
    }),
    say('rithy', 'smirk', 'right', {
      en: "Four years, Sochetra. I've thought about that serpent shot every single day.",
      km: 'បួនឆ្នាំហើយ សុចិត្រា។ ខ្ញុំគិតពីស៊ុតនាគនោះរាល់ថ្ងៃ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Rithy. You got taller.',
      km: 'រិទ្ធី។ ឯងខ្ពស់ជាងមុន។',
    }),
    say('rithy', 'neutral', 'right', {
      en: 'I got better. I trained until my coach begged me to go home.',
      km: 'ខ្ញុំពូកែជាងមុន។ ខ្ញុំហ្វឹកហាត់រហូតដល់គ្រូបង្វឹកអង្វរឲ្យខ្ញុំទៅផ្ទះ។',
    }),
    say('rithy', 'smirk', 'right', {
      en: "I have my own sword now. Preah Khan Strike. Tomorrow you'll see it up close.",
      km: 'ឥឡូវខ្ញុំមានដាវផ្ទាល់ខ្លួនហើយ។ ទាត់ព្រះខ័ន។ ថ្ងៃស្អែក ឯងនឹងឃើញវាពីជិត។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "Good. I didn't come here for an easy final.",
      km: 'ល្អ។ ខ្ញុំមិនមកទីនេះដើម្បីវគ្គផ្ដាច់ព្រ័ត្រងាយៗទេ។',
    }),
  ]),
};
