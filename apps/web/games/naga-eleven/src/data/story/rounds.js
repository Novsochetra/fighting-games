const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

const khmerNumber = (number) =>
  String(number)
    .split('')
    .map((digit) => KHMER_DIGITS[Number(digit)])
    .join('');

export const FRIENDLY = { en: 'Friendly', km: 'ការប្រកួតមិត្តភាព' };

export const SEMI_FINAL = { en: 'Semi-final', km: 'វគ្គពាក់កណ្ដាលផ្ដាច់ព្រ័ត្រ' };

export const FINAL = { en: 'Final', km: 'វគ្គផ្ដាច់ព្រ័ត្រ' };

export const groupMatch = (number) => ({
  en: `Group, match ${number}`,
  km: `វគ្គចែកពូល ប្រកួតទី${khmerNumber(number)}`,
});
