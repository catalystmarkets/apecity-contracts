const Decimal = require('decimal.js');

// Set the precision to a high value
Decimal.set({ precision: 100 });

// Constants
const r = new Decimal('0.607071');
// const M = new Decimal('0.9').times(new Decimal('10').pow(18));
let Balance_initial;
const Supply_initial = new Decimal('1000').times(new Decimal('10').pow(18));

const Balance_final = new Decimal('4.2').times(new Decimal('10').pow(18));
const Supply_final = (new Decimal('0.5').times(new Decimal('10').pow(27)));


const m = Balance_final.div(r.times(Supply_final.pow(new Decimal('1').div(r))));

// Calculate n
const n = new Decimal('1').div(r).minus(1);

// Calculate B3
Balance_initial = Balance_final.times(Supply_initial.div(Supply_final).pow(new Decimal('1').div(r)));

console.log('m =', m.toFixed());
console.log('n =', n.toFixed());
// console.log('Stotal =', Stotal.toFixed());
console.log('Balance_initial =', Balance_initial.toFixed());
// console.log('B4 =', B4.toFixed());