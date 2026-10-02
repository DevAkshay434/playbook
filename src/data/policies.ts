export interface Policy {
  policy: string;
  note: string;
}

export const policies: Policy[] = [
  {
    "policy": "Performance Satisfaction Guarantee (return / refund)",
    "note": "Posted on the website only \u2014 customers do NOT check a box agreeing to it at checkout. Never tell a customer they agreed to it at checkout. That claim loses chargebacks."
  },
  {
    "policy": "Shipping",
    "note": "Standard ground freight is the only service level. There is no expedited tier to escalate for."
  },
  {
    "policy": "Privacy (incl. SMS / A2P consent)",
    "note": "SMS consent language is compliance-controlled. Do not paraphrase it in a message to a customer."
  },
  {
    "policy": "Terms of Service",
    "note": "Referenced in disputes. Link it, do not summarize it."
  },
  {
    "policy": "Contact",
    "note": "The published contact path is what carriers and banks check in a dispute."
  },
  {
    "policy": "Legal Notice",
    "note": "Escalate anything that cites it."
  }
];
