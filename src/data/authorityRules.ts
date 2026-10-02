import { AuthorityRule } from '@/types/playbook';

export const authorityRules: AuthorityRule[] = [
  {
    "action": "Reship a lost or damaged unit, standard ground",
    "who": "Any CS agent",
    "lvl": "resolve",
    "ceiling": "Full unit",
    "confirm": false,
    "cond": "Carrier confirms loss/damage, or photos show it. Never offer expedited."
  },
  {
    "action": "Replace a valve head jammed by carbon fines (bone char / Gold+)",
    "who": "Any CS agent",
    "lvl": "resolve",
    "ceiling": "Valve + freight",
    "confirm": false,
    "cond": "Known media issue \u2014 SoftPro's responsibility. Do not make the customer prove it."
  },
  {
    "action": "Send a missing or wrong small part (basket, o-ring, clip, cable)",
    "who": "Any CS agent",
    "lvl": "resolve",
    "ceiling": "Part + ground freight",
    "confirm": false,
    "cond": "Any order where the part was clearly not in the box."
  },
  {
    "action": "Waive the restocking fee on a return",
    "who": "CS agent",
    "lvl": "judge",
    "ceiling": "$150",
    "confirm": true,
    "cond": "Customer is escalating and the return is otherwise clean. Above the ceiling, escalate."
  },
  {
    "action": "Goodwill credit to keep a borderline case out of dispute",
    "who": "CS agent",
    "lvl": "judge",
    "ceiling": "$250",
    "confirm": true,
    "cond": "Chargeback prevention beats policy enforcement in borderline cases. Log the reasoning."
  },
  {
    "action": "Reimburse a customer's plumber / labor cost",
    "who": "Heather or Justin",
    "lvl": "escalate",
    "ceiling": "\u2014",
    "confirm": false,
    "cond": "Shared-responsibility judgment call every time. Precedent: 50% of the invoice."
  },
  {
    "action": "Anything on an order with an open chargeback",
    "who": "Heather",
    "lvl": "escalate",
    "ceiling": "\u2014",
    "confirm": false,
    "cond": "Shopify blocks refunds while a dispute is open, and we are under a reserve hold."
  },
  {
    "action": "Full refund with no return of the unit",
    "who": "Heather",
    "lvl": "escalate",
    "ceiling": "\u2014",
    "confirm": false,
    "cond": "Always. No exceptions at agent level."
  },
  {
    "action": "Any promise of expedited, next-day, or 2-day shipping",
    "who": "Nobody",
    "lvl": "escalate",
    "ceiling": "Not offered",
    "confirm": false,
    "cond": "Not available at any price, on any order, including replacements."
  }
];
