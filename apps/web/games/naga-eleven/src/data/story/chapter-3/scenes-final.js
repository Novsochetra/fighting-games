import { narrate, say, scene } from '../script.js';

export const FINAL_SCENES = {
  'ch3-final-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The final of the Asian Youth Championship. Cambodia against Japan, again.',
      km: 'វគ្គផ្ដាច់ព្រ័ត្រ ជើងឯកយុវជនអាស៊ី។ កម្ពុជា ទល់នឹង ជប៉ុន ម្ដងទៀត។',
    }),
    say('haruto', 'neutral', 'right', {
      en: 'Full power, as I promised. I hope you kept your promise too.',
      km: 'កម្លាំងពេញ ដូចដែលខ្ញុំបានសន្យា។ ខ្ញុំសង្ឃឹមថាអ្នកក៏រក្សាពាក្យសន្យាដែរ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "We did. We're not two good teams anymore. We're one.",
      km: 'យើងរក្សាហើយ។ យើងលែងជាក្រុមល្អពីរទៀតហើយ។ យើងជាក្រុមតែមួយ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: "Back home, they've put screens up in the pagodas. The whole country is watching.",
      km: 'នៅស្រុកកំណើត គេដាក់អេក្រង់នៅតាមវត្ត។ ប្រទេសទាំងមូលកំពុងមើល។',
    }),
    say('coach-bora', 'happy', 'right', {
      en: 'Go and give them something to remember.',
      km: 'ទៅ ហើយផ្ដល់ឲ្យពួកគេនូវអ្វីដែលគួរចងចាំ។',
    }),
  ]),

  'ch3-final-kickoff': scene('black', 'tense', [
    say('haruto', 'smirk', 'right', {
      en: 'The moon is full tonight. So am I.',
      km: 'យប់នេះព្រះច័ន្ទពេញវង់។ ខ្ញុំក៏ពេញកម្លាំងដែរ។',
    }),
    say('rithy', 'smirk', 'right', { en: 'Great. Another poet.', km: 'ល្អណាស់។ កវីម្នាក់ទៀតហើយ។' }),
  ]),

  'ch3-final-duel': scene('black', 'tense', [
    say('haruto', 'determined', 'right', {
      en: "Silent Moon. Mirror Step. You'll see everything I have.",
      km: 'ចន្ទស្ងាត់។ ជំហានកញ្ចក់។ អ្នកនឹងឃើញអ្វីៗទាំងអស់ដែលខ្ញុំមាន។',
    }),
    say('sochetra', 'determined', 'left', {
      en: "And you'll see what two people can do with one ball.",
      km: 'ហើយអ្នកនឹងឃើញថា មនុស្សពីរនាក់អាចធ្វើអ្វីបានជាមួយបាល់តែមួយ។',
    }),
  ]),

  'ch3-final-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Japan lead! Haruto, cool as the night air.',
      km: 'ជប៉ុននាំមុខ! ហារូតូ ត្រជាក់ដូចខ្យល់ពេលយប់។',
    }),
    say('rithy', 'determined', 'right', {
      en: 'No blaming this time. Sochetra, with me.',
      km: 'លើកនេះគ្មានការបន្ទោសគ្នាទេ។ សុចិត្រា មកជាមួយខ្ញុំ។',
    }),
    say('sochetra', 'determined', 'left', { en: 'Always.', km: 'ជានិច្ច។' }),
  ]),

  'ch3-final-halftime': scene('dressing-room', 'tense', [
    say('coach-bora', 'neutral', 'right', {
      en: "Haruto reads every pass before it's made. So make passes even you didn't plan.",
      km: 'ហារូតូអានរាល់ការហុចមុនពេលវាកើតឡើង។ អញ្ចឹង ហុចបាល់ដែលសូម្បីតែឯងក៏មិនបានគ្រោងទុក។',
    }),
    say('dara', 'happy', 'right', {
      en: 'So... play without thinking? Finally, my specialty.',
      km: 'អញ្ចឹង... លេងដោយមិនគិត? ទីបំផុត ជំនាញរបស់ខ្ញុំ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Play by feel. Rithy, Sochetra, you know each other now. Trust that.',
      km: 'លេងតាមអារម្មណ៍។ រិទ្ធី សុចិត្រា ឯងស្គាល់គ្នាហើយ។ ទុកចិត្តលើវា។',
    }),
  ]),

  'ch3-final-twin': scene('angkor-sunrise', 'hope', [
    narrate({
      en: 'Fifteen minutes left. Sochetra and Rithy run side by side, and something old stirs.',
      km: 'នៅសល់ដប់ប្រាំនាទី។ សុចិត្រា និងរិទ្ធីរត់ក្បែរគ្នា ហើយអ្វីមួយដ៏បុរាណកម្រើកខ្លួន។',
    }),
    say('rithy', 'determined', 'right', {
      en: 'I feel it too. As if something is pulling us the same way.',
      km: 'ខ្ញុំក៏មានអារម្មណ៍ដែរ។ ដូចជាមានអ្វីមួយទាញយើងទៅទិសតែមួយ។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'Gods and demons, one Naga. Together, Rithy!',
      km: 'ទេវតា និងអសុរ នាគតែមួយ។ ជាមួយគ្នា រិទ្ធី!',
    }),
    narrate({
      en: 'Two heads rise from one body of light, one red, one gold.',
      km: 'ក្បាលពីររលេចឡើងពីរាងកាយពន្លឺតែមួយ មួយក្រហម មួយមាស។',
    }),
    say('sochetra', 'determined', 'left', { en: 'TWIN NAGA!', km: 'នាគភ្លោះ!' }),
    narrate({
      en: 'Twin Naga learned! A shot struck by two, only while Rithy is on the pitch.',
      km: 'បានរៀន នាគភ្លោះ! ការទាត់ដោយពីរនាក់ ដែលប្រើបានតែពេលរិទ្ធីនៅលើទីលាន។',
    }),
    narrate({
      en: 'A DUO: with Rithy near you, hold SHOOT to full. Both of you pay.',
      km: 'ក្បាច់គូ៖ ពេលរិទ្ធីនៅជិត សង្កត់ SHOOT ឲ្យពេញ។ អ្នកទាំងពីរប្រើស្មារតី។',
    }),
  ]),

  'ch3-final-push': scene('black', 'hope', [
    say('coach-bora', 'determined', 'right', {
      en: "It's level! Ten minutes! Everything you have!",
      km: 'ពិន្ទុស្មើគ្នា! ដប់នាទីទៀត! បញ្ចេញអ្វីៗដែលឯងមានទាំងអស់!',
    }),
    say('dara', 'determined', 'right', {
      en: 'Nothing gets past me now. Go and win it!',
      km: 'ឥឡូវគ្មានអ្វីហួសខ្ញុំទេ។ ទៅយកជ័យជម្នះមក!',
    }),
  ]),

  'ch3-final-twin-goal': scene('black', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: "Two serpents of light! Sochetra and Rithy, together! It's in!",
      km: 'នាគពន្លឺពីរ! សុចិត្រា និងរិទ្ធី រួមគ្នា! ចូលហើយ!',
    }),
    say('haruto', 'shocked', 'right', {
      en: "Two players... one shot. I couldn't read it. There was nothing to read.",
      km: 'កីឡាករពីរនាក់... ស៊ុតតែមួយ។ ខ្ញុំអានវាមិនចេញ។ គ្មានអ្វីឲ្យអានទេ។',
    }),
    say('rithy', 'happy', 'right', {
      en: "That's what happens when you pass it back!",
      km: 'នេះហើយ ពេលឯងហុចវាត្រឡប់មកវិញ!',
    }),
  ]),
};
