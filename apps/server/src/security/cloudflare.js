import { BlockList, isIP } from 'node:net';

// The arcade's domain is proxied by Cloudflare, so the address Railway's proxy sees is a Cloudflare
// edge, shared by every visitor it serves, and the visitor's own is in CF-Connecting-IP, which
// Cloudflare always writes itself. That header is believed only from Cloudflare's own addresses
// (https://www.cloudflare.com/ips/), as anyone reaching Railway directly could write it too.
const CLOUDFLARE_RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];

const familyOf = (address) => (isIP(address) === 6 ? 'ipv6' : 'ipv4');

const cloudflare = new BlockList();

for (const range of CLOUDFLARE_RANGES) {
  const [network, prefix] = range.split('/');

  cloudflare.addSubnet(network, Number(prefix), familyOf(network));
}

export function isCloudflareAddress(address) {
  return isIP(address) !== 0 && cloudflare.check(address, familyOf(address));
}

export function visitorBehindCloudflare(headers, edge) {
  const visitor = headers['cf-connecting-ip']?.trim();

  return visitor && isIP(visitor) !== 0 ? visitor : edge;
}
