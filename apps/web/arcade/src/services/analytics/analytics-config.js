// The Google Analytics property of the live arcade. A copy that runs anywhere else (a laptop, a
// test, a preview deploy) asks nothing and sends nothing, so its visits never mix into the numbers.
export const MEASUREMENT_ID = 'G-ZBPWM5M916';
export const LIVE_HOSTS = ['www.khmerarcade.games', 'khmerarcade.games'];

export const isAnalyticsEnabled = ({ measurementId, hostname }) =>
  /^G-[A-Z0-9]+$/.test(measurementId) && LIVE_HOSTS.includes(hostname);
