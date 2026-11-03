import { narrate, say, scene } from '../script.js';

export const FINAL_SCENES = {
  'ch4-final-before': scene('stadium-tunnel', 'tense', [
    narrate({
      en: 'The final of the World Championship. Cambodia against Brazil.',
      km: 'វគ្គផ្ដាច់ព្រ័ត្រ ជើងឯកពិភពលោក។ កម្ពុជា ទល់នឹង ប្រេស៊ីល។',
    }),
    say('rafael', 'happy', 'right', {
      en: 'Cambodia! My friends! Full power today, I promise. Is that okay?',
      km: 'កម្ពុជា! មិត្តខ្ញុំ! ថ្ងៃនេះកម្លាំងពេញ ខ្ញុំសន្យា។ មិនអីទេណា?',
    }),
    say('sochetra', 'happy', 'left', {
      en: "We wouldn't want it any other way.",
      km: 'យើងមិនចង់បានបែបផ្សេងទេ។',
    }),
    say('coach-bora', 'neutral', 'right', {
      en: 'Thirteen years ago, a teacher in Chrey saw a boy dribble past three bigger kids.',
      km: 'ដប់បីឆ្នាំមុន គ្រូម្នាក់នៅជ្រៃបានឃើញក្មេងប្រុសម្នាក់នាំបាល់កាត់ក្មេងធំៗបីនាក់។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Tonight, the whole world sees what he saw. Go.',
      km: 'យប់នេះ ពិភពលោកទាំងមូលនឹងឃើញអ្វីដែលគាត់បានឃើញ។ ទៅ។',
    }),
  ]),

  'ch4-final-kickoff': scene('black', 'tense', [
    say('rafael', 'happy', 'right', {
      en: "The biggest stage in the world, and you're smiling! Finally!",
      km: 'ឆាកធំជាងគេលើលោក ហើយអ្នកញញឹម! ទីបំផុត!',
    }),
    say('sochetra', 'happy', 'left', {
      en: "For once, Rafael, you'll be the one chasing.",
      km: 'ម្ដងនេះ រ៉ាហ្វាអែល អ្នកនឹងជាអ្នកដេញវិញម្ដង។',
    }),
  ]),

  'ch4-final-duel': scene('black', 'tense', [
    say('rafael', 'smirk', 'right', {
      en: 'Samba Mirage, at full power! Which one of me is real?',
      km: 'សាំបាមរីចិកា កម្លាំងពេញ! ខ្ញុំមួយណាជាខ្ញុំពិត?',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'The one with the ball. I only watch the ball.',
      km: 'អ្នកដែលមានបាល់។ ខ្ញុំមើលតែបាល់ទេ។',
    }),
  ]),

  'ch4-final-conceded': scene('black', 'sad', [
    say('announcer', 'happy', 'right', {
      en: 'Brazil take the lead in the World Championship final!',
      km: 'ប្រេស៊ីលនាំមុខក្នុងវគ្គផ្ដាច់ព្រ័ត្រជើងឯកពិភពលោក!',
    }),
    say('rithy', 'determined', 'right', {
      en: "We've been behind before. Every single time, we came back.",
      km: 'យើងធ្លាប់តាមក្រោយពីមុនមកហើយ។ រាល់ដង យើងតាមទាន់វិញ។',
    }),
    say('dara', 'determined', 'right', {
      en: "Nothing else gets past me. I swear on my mother's pots.",
      km: 'គ្មានអ្វីហួសខ្ញុំទៀតទេ។ ខ្ញុំស្បថលើឆ្នាំងម៉ែខ្ញុំ។',
    }),
  ]),

  'ch4-final-halftime': scene('dressing-room', 'tense', [
    say('coach-bora', 'neutral', 'right', {
      en: "Thirty years I've coached. I've never seen a team like this one.",
      km: 'ខ្ញុំធ្វើជាគ្រូបង្វឹកសាមសិបឆ្នាំ។ ខ្ញុំមិនដែលឃើញក្រុមណាដូចក្រុមនេះទេ។',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Forty-five minutes. Leave nothing in this room. Take it all out there.',
      km: 'សែសិបប្រាំនាទីទៀត។ កុំទុកអ្វីនៅក្នុងបន្ទប់នេះ។ យកវាទាំងអស់ចេញទៅទីលាន។',
    }),
    say('sochetra', 'determined', 'left', {
      en: 'For Chrey. For Cambodia. For every kid with a patched ball.',
      km: 'ដើម្បីជ្រៃ។ ដើម្បីកម្ពុជា។ ដើម្បីក្មេងគ្រប់រូបដែលមានបាល់ចាស់ប៉ះៗ។',
    }),
  ]),

  'ch4-final-push': scene('black', 'hope', [
    say('rithy', 'determined', 'right', {
      en: "It's level! Ten minutes to change history!",
      km: 'ពិន្ទុស្មើគ្នា! ដប់នាទីដើម្បីផ្លាស់ប្ដូរប្រវត្តិសាស្ត្រ!',
    }),
    say('coach-bora', 'determined', 'right', {
      en: 'Everything now! Everything!',
      km: 'ទាំងអស់ឥឡូវនេះ! ទាំងអស់!',
    }),
  ]),

  'ch4-final-seven-goal': scene('black', 'triumph', [
    say('announcer', 'shocked', 'right', {
      en: 'SEVEN HEADS OF LIGHT! I have never, ever seen anything like it! GOAL!',
      km: 'ក្បាលពន្លឺប្រាំពីរ! ខ្ញុំមិនដែលឃើញអ្វីដូចនេះទាល់តែសោះ! ចូលហើយ!',
    }),
    say('rafael', 'shocked', 'right', {
      en: '...Beautiful. Now THAT is football.',
      km: '...ស្អាតណាស់។ នោះហើយទើបជាបាល់ទាត់។',
    }),
    say('sochetra', 'cry', 'left', { en: 'Ta... did you see?', km: 'លោកតា... ឃើញទេ?' }),
  ]),
};
