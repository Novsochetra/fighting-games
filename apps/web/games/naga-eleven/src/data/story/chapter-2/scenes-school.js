import { narrate, say, scene } from '../script.js';

export const SCHOOL_SCENES = {
  'ch2-intro': scene('high-school', 'hope', [
    narrate({
      en: 'Kampong Cham High School. Eleven a side, a real pitch, and a coach who never smiles.',
      km: 'វិទ្យាល័យកំពង់ចាម។ ម្ខាងដប់មួយនាក់ ទីលានពិតប្រាកដ និងគ្រូបង្វឹកម្នាក់ដែលមិនដែលញញឹម។',
    }),
    say('dara', 'happy', 'right', {
      en: "Look at us, Sochetra. High school. I've grown so much.",
      km: 'មើលយើងមើល សុចិត្រា។ វិទ្យាល័យហើយ។ ខ្ញុំធំឡើងច្រើនណាស់។',
    }),
    say('sochetra', 'smirk', 'left', {
      en: 'Mostly your appetite.',
      km: 'ធំជាងគេគឺចំណង់ញ៉ាំរបស់ឯង។',
    }),
    say('dara', 'smirk', 'right', {
      en: 'A keeper needs a big appetite. To eat up every shot.',
      km: 'អ្នកចាំទីត្រូវការចំណង់ញ៉ាំធំ។ ដើម្បីលេបបាល់គ្រប់គ្រាប់។',
    }),
    narrate({
      en: "Since the cup, the whole province knows Sochetra's name. Maybe a little too well.",
      km: 'តាំងពីពានរង្វាន់នោះមក អ្នកខេត្តទាំងមូលស្គាល់ឈ្មោះសុចិត្រា។ ប្រហែលស្គាល់ច្រើនពេកបន្តិច។',
    }),
  ]),

  'ch2-sokha': scene('high-school', 'tense', [
    say('coach-sokha', 'angry', 'right', {
      en: "You're late. Ten minutes. Run ten laps.",
      km: 'ឯងមកយឺត។ ដប់នាទី។ រត់ដប់ជុំ។',
    }),
    say('sochetra', 'smirk', 'left', {
      en: 'Sorry, Coach. Some kids wanted me to sign their footballs.',
      km: 'សុំទោស លោកគ្រូ។ មានក្មេងៗចង់ឲ្យខ្ញុំចុះហត្ថលេខាលើបាល់គេ។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'I watched your little final. You won with one lucky shot and a lot of running.',
      km: 'ខ្ញុំបានមើលវគ្គផ្ដាច់ព្រ័ត្រតូចរបស់ឯង។ ឯងឈ្នះដោយសារស៊ុតមួយគ្រាប់ដែលមានសំណាង និងការរត់ច្រើន។',
    }),
    say('sochetra', 'angry', 'left', {
      en: 'Lucky?! That was the Naga Shot!',
      km: 'សំណាង?! នោះគឺទាត់នាគ!',
    }),
    say('coach-sokha', 'angry', 'right', {
      en: "Here, a gift that doesn't work is worth nothing. Football is eleven, not one. Laps. Now.",
      km: 'នៅទីនេះ ទេពកោសល្យដែលមិនខំប្រឹង គ្មានតម្លៃទេ។ បាល់ទាត់គឺដប់មួយនាក់ មិនមែនម្នាក់ទេ។ រត់ទៅ។ ឥឡូវ។',
    }),
    say('dara', 'sad', 'right', {
      en: "I'll run with you. Don't argue. He has the face of a man who adds laps.",
      km: 'ខ្ញុំរត់ជាមួយឯង។ កុំប្រកែក។ មុខគាត់ជាមុខមនុស្សដែលចេះតែបន្ថែមជុំ។',
    }),
  ]),

  'ch2-temple-before': scene('temple-dawn', 'calm', [
    narrate({
      en: 'Five in the morning. The long steps of Phnom Srey, mist on the paddies, monks walking for alms.',
      km: 'ម៉ោងប្រាំព្រឹក។ ជណ្ដើរវែងនៃភ្នំស្រី អ័ព្ទលើវាលស្រែ ព្រះសង្ឃនិមន្តបិណ្ឌបាត។',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Up the steps with the ball at your feet. Down again. Then again.',
      km: 'ឡើងជណ្ដើរ ជាមួយបាល់នៅជើង។ ចុះមកវិញ។ ហើយធ្វើម្ដងទៀត។',
    }),
    say('sochetra', 'shocked', 'left', {
      en: 'With the ball? There are hundreds of steps!',
      km: 'ទាំងបាល់ឬ? ជណ្ដើររាប់រយកាំ!',
    }),
    say('coach-sokha', 'neutral', 'right', {
      en: 'Hanuman leapt across the sea to Lanka. You can manage one hill.',
      km: 'ហនុមានលោតឆ្លងសមុទ្រទៅក្រុងលង្កា។ ឯងប្រាកដជាឡើងភ្នំមួយបាន។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Then the cones on the flat. Light feet. A defender is just a step you jump over.',
      km: 'បន្ទាប់មក កោននៅលើដីរាប។ ជើងស្រាលៗ។ ខ្សែការពារគ្រាន់តែជាកាំជណ្ដើរមួយដែលឯងលោតរំលង។',
    }),
  ]),

  'ch2-temple-after': scene('temple-dawn', 'hope', [
    narrate({
      en: 'On the fortieth morning, Sochetra stops thinking about his feet. They simply fly.',
      km: 'នៅព្រឹកទីសែសិប សុចិត្រាឈប់គិតពីជើងខ្លួនឯង។ ជើងគេគ្រាន់តែហោះ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Like Hanuman over the sea... HANUMAN LEAP!',
      km: 'ដូចហនុមានហោះឆ្លងសមុទ្រ... លោតហនុមាន!',
    }),
    say('coach-sokha', 'happy', 'right', { en: '...Hm. Not bad.', km: '...អឺ។ មិនអាក្រក់ទេ។' }),
    say('dara', 'shocked', 'right', {
      en: 'He smiled! Coach Sokha smiled! Somebody write down the date!',
      km: 'គាត់ញញឹម! លោកគ្រូសុខាញញឹម! កត់ថ្ងៃខែទុកផង!',
    }),
    narrate({
      en: 'Hanuman Leap learned! Choose it in a one-on-one to leap over a tackle.',
      km: 'បានរៀន លោតហនុមាន! ជ្រើសវាពេលប៉ះគ្នាមួយទល់មួយ ដើម្បីលោតរំលងការដណ្ដើមបាល់។',
    }),
    narrate({
      en: 'Or, with the ball, tap RUN twice to leap at once.',
      km: 'ឬពេលមានបាល់ ចុច RUN ពីរដងលឿនៗ ដើម្បីលោតភ្លាម។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Leap past him, then strike at once. One skill straight into the next is a chain.',
      km: 'លោតហួសគេ រួចទាត់ភ្លាម។ ជំនាញមួយបន្តភ្លាមទៅជំនាញមួយទៀត ហៅថាច្រវាក់។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Hanuman Leap into Naga Shot... the Flying Naga!',
      km: 'លោតហនុមាន បន្តទៅទាត់នាគ... នាគហោះ!',
    }),
  ]),

  'ch2-wall-before': scene('training-ground', 'hope', [
    say('coach-sokha', 'neutral', 'right', {
      en: "Targets in the corners. Hit them past Dara. He won't make it easy.",
      km: 'គោលដៅនៅជ្រុងទី។ ទាត់ឲ្យត្រូវ ហួសពីដារ៉ា។ គេនឹងមិនឲ្យងាយទេ។',
    }),
    say('dara', 'determined', 'right', {
      en: "I've been training too, you know. At night. In secret. With my mother's pots.",
      km: 'ខ្ញុំក៏ហ្វឹកហាត់ដែរ ដឹងទេ។ ពេលយប់។ ដោយសម្ងាត់។ ជាមួយឆ្នាំងម៉ែខ្ញុំ។',
    }),
    say('sochetra', 'smirk', 'left', { en: 'Show me.', km: 'បង្ហាញមកមើល។' }),
  ]),

  'ch2-wall-after': scene('training-ground', 'triumph', [
    narrate({
      en: 'One shot Dara will not let through. He stands like nine hundred years of stone.',
      km: 'មានស៊ុតមួយគ្រាប់ ដែលដារ៉ាមិនឲ្យចូល។ គេឈរដូចថ្មអាយុប្រាំបួនរយឆ្នាំ។',
    }),
    say('dara', 'happy', 'right', {
      en: 'ANGKOR WALL! Nine hundred years old and still standing!',
      km: 'កំពែងអង្គរ! ប្រាំបួនរយឆ្នាំហើយ នៅតែឈររឹងមាំ!',
    }),
    say('sochetra', 'happy', 'left', {
      en: 'Dara! When did you learn that?',
      km: 'ដារ៉ា! ឯងរៀនវាតាំងពីពេលណា?',
    }),
    say('dara', 'smirk', 'right', {
      en: 'Somewhere between the third pot and the fourth.',
      km: 'នៅចន្លោះឆ្នាំងទីបី និងឆ្នាំងទីបួន។',
    }),
    say('coach-sokha', 'determined', 'right', {
      en: 'Good. The National High School Championship starts on Saturday. The group comes first.',
      km: 'ល្អ។ ការប្រកួតជើងឯកវិទ្យាល័យថ្នាក់ជាតិ ចាប់ផ្ដើមថ្ងៃសៅរ៍នេះ។ វគ្គចែកពូលមុនគេ។',
    }),
  ]),
};
