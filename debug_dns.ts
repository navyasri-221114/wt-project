import dns from 'dns';

const target = '_mongodb._tcp.campus-placement-portal.m57ijwg.mongodb.net';

dns.resolveSrv(target, (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});

dns.resolve4('campus-placement-portal.m57ijwg.mongodb.net', (err, addresses) => {
    if (err) {
      console.error('DNS Resolve4 Error:', err);
    } else {
      console.log('IPv4 Addresses:', addresses);
    }
  });
