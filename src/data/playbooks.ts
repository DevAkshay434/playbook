import { Playbook } from '@/types/playbook';

export const playbooks: Playbook[] = [
  {
    "id": "orientation",
    "slug": "orientation",
    "title": "Unit arrived upside down or on its side",
    "category": "freight",
    "authority": "resolve",
    "customerPhrases": [
      "It came off the truck upside down",
      "the tank was laying on its side",
      "the media shifted"
    ],
    "aliases": [
      "upside down",
      "on its side",
      "sideways",
      "tipped over",
      "laying down",
      "media shifted",
      "spill cap",
      "freight damage",
      "tipped",
      "bed shift",
      "orientation"
    ],
    "facts": [
      "Softeners routinely end up on their side in transit \u2014 they go through freight hubs on their sides all the time.",
      "The spill cap exists partly for this reason.",
      "A shifted media bed does not affect how the unit functions.",
      "Orientation on its own is not damage. Crushing, punctures, and a cracked jacket are."
    ],
    "troubleshootingSteps": [
      "Ask for photos of the unit as it sits, plus the box.",
      "Look for actual damage: crushed jacket, cracked tank, bent valve, leaking. That is a freight claim \u2014 see the lost/damaged entry.",
      "If the unit is intact, tell them the orientation is normal and the unit is fine to install.",
      "Log it. Repeat orientation complaints on the same lane are worth flagging."
    ],
    "suggestedResponse": "I'm sorry it showed up that way \u2014 it doesn't look good on the truck, I know. These tanks ship through freight hubs on their sides routinely, which is exactly why there's a spill cap on top. If the media bed shifted during transit, that doesn't affect how the unit works once it's plumbed in and running. Can you send me a couple of photos of the jacket and the valve? If there's any crushing or cracking I'll get a replacement moving today.",
    "dontDo": [
      "Don't agree that it's damaged before you see photos \u2014 that becomes the customer's expectation.",
      "Don't offer to expedite a replacement. We don't have one to offer."
    ],
    "policyReferences": [],
    "source": "Shipping orientation position",
    "lastConfirmed": "Aug 31, 2026",
    "knownGap": false
  },
  {
    "id": "expedite",
    "slug": "expedite",
    "title": "Customer wants expedited, next-day, or 2-day shipping",
    "category": "freight",
    "authority": "resolve",
    "customerPhrases": [
      "Can you overnight it?",
      "I need it by Friday",
      "you lost mine, the least you can do is rush the replacement"
    ],
    "aliases": [
      "expedite",
      "expedited",
      "overnight",
      "next day",
      "next-day",
      "2 day",
      "two day",
      "rush",
      "air freight",
      "faster shipping",
      "priority",
      "in a hurry",
      "by friday",
      "asap shipping"
    ],
    "facts": [
      "SoftPro does not offer expedited shipping under any circumstance \u2014 including replacements for lost or damaged shipments.",
      "Reason: the units are large and heavy, and carrier expedited freight cost is not financially accommodatable.",
      "Replacements and reshipments go out standard ground freight, same as any order.",
      "This is not a limit you can escalate past. There is no rate to buy."
    ],
    "troubleshootingSteps": [
      "Say no clearly and early. Do not leave it as 'let me check' \u2014 that invites a second ask.",
      "Give the real reason: freight weight, not policy stinginess.",
      "Give them the concrete ground transit estimate instead, so they have a date to plan around.",
      "If the delay caused a real cost (plumber booked, water off), that is a goodwill judgment call \u2014 see the authority table."
    ],
    "suggestedResponse": "I wish I could, but expedited freight isn't something we're able to offer on these \u2014 the tanks are large and heavy enough that air and expedited ground service isn't something we can accommodate, even on replacements. What I can do is get it on the truck on the next outbound and send you the tracking as soon as it's assigned so you can schedule around a firm date.",
    "dontDo": [
      "Don't say 'let me see if I can get approval.' There's nothing to approve.",
      "Don't quote a delivery date the carrier hasn't given you."
    ],
    "policyReferences": [],
    "source": "Expedited shipping position",
    "lastConfirmed": "Sep 7, 2026",
    "knownGap": false
  },
  {
    "id": "lostdamaged",
    "slug": "lostdamaged",
    "title": "Shipment lost, or arrived with real freight damage",
    "category": "freight",
    "authority": "resolve",
    "customerPhrases": [
      "It never showed up",
      "the driver left a crushed box",
      "tracking hasn't moved in a week"
    ],
    "aliases": [
      "lost",
      "never arrived",
      "missing shipment",
      "crushed",
      "damaged",
      "freight claim",
      "tracking stuck",
      "didn't deliver",
      "damaged in transit",
      "broken tank",
      "cracked"
    ],
    "facts": [
      "Current carrier is UPS (moved off FedEx).",
      "A reship goes out standard ground. There is no faster option to offer.",
      "Photos of the box and the unit are what make the carrier claim work \u2014 get them before the customer discards packaging."
    ],
    "troubleshootingSteps": [
      "Get photos: outer box on all visible sides, the damage, and the shipping label.",
      "Tell the customer to keep all packaging until the claim closes.",
      "Open the carrier claim and note the claim number on the Richpanel ticket.",
      "Authorize the reship on standard ground \u2014 you do not need approval for this.",
      "Set the customer's expectation on transit time in the same message you confirm the reship."
    ],
    "suggestedResponse": "Thanks for the photos \u2014 that's everything I need. I'm putting a replacement on the truck for you and opening the claim with the carrier on our side, so there's nothing further you need to do about the damaged one. Please hold onto the packaging until I confirm the claim is closed. I'll send tracking as soon as it's assigned.",
    "dontDo": [
      "Don't wait on the carrier claim before reshipping. The claim is our problem, not theirs.",
      "Don't promise expedited service on the replacement."
    ],
    "policyReferences": [],
    "source": "Freight handling + expedited shipping position",
    "lastConfirmed": "Sep 7, 2026",
    "knownGap": false
  },
  {
    "id": "tankmixup",
    "slug": "tankmixup",
    "title": "Wrong valve head installed on the wrong tank",
    "category": "product",
    "authority": "resolve",
    "customerPhrases": [
      "The heads don't fit right",
      "nothing on the tanks says which is which",
      "you shipped them unlabeled"
    ],
    "aliases": [
      "wrong head",
      "swapped heads",
      "mixed up tanks",
      "tank mix up",
      "unlabeled",
      "not labeled",
      "no label",
      "which tank is which",
      "carbon on softener",
      "softener head on carbon",
      "wrong valve"
    ],
    "facts": [
      "Recurring pattern: customer unboxes both units at once, mixes up the tanks, and installs the carbon head on the softener tank and vice versa.",
      "Tank labels exist but sit at the bottom of the tank, under the jacket \u2014 not visible once installed.",
      "The carbon filter valve ships in a smaller box on top of the carbon filter tank, inside the bigger box. The softener valve does not ship attached to the softener tank.",
      "So the pairing identifies both tanks by elimination: the tank that arrived with a valve on it is the carbon tank; the other one is the softener.",
      "The outer packaging is labeled 'softener' and 'carbon filter'. Once packaging is off, there's no visible marking \u2014 which is where the customer's frustration is coming from, and it's a fair point."
    ],
    "troubleshootingSteps": [
      "Do not argue about labeling first. Fix the install first.",
      "Establish which tank had the valve boxed with it \u2014 that one is the carbon filter.",
      "If they already threw out the packaging, have them check the bottom of each tank under the jacket edge for the label.",
      "Walk them through swapping the heads back onto the correct tanks.",
      "Acknowledge the labeling gap honestly. It's a real product feedback item, not a customer error to lecture about."
    ],
    "suggestedResponse": "Let's get this sorted \u2014 it's an easy fix. Here's the quickest way to tell them apart: the carbon filter valve ships in its own smaller box sitting on top of the carbon tank, inside the big carton. The softener valve doesn't ship with its tank. So whichever tank had a valve packed with it is your carbon filter, and the other one is the softener. And you're right that once the packaging is off there's nothing obvious on the tanks themselves \u2014 the label sits down at the bottom under the jacket. I'm passing that along, because it shouldn't be that hard to tell.",
    "dontDo": [
      "Don't tell the customer they should have read the box. They already threw it away.",
      "Don't claim the tanks are clearly labeled. They aren't, and they'll photograph it."
    ],
    "policyReferences": [],
    "source": "Tank mix-up position",
    "lastConfirmed": "Sep 9, 2026",
    "knownGap": false
  },
  {
    "id": "bonechar",
    "slug": "bonechar",
    "title": "Black carbon fines in the softener, or a jammed valve (Gold+ / bone char)",
    "category": "product",
    "authority": "resolve",
    "customerPhrases": [
      "There's black grit everywhere",
      "the carbon contaminated my resin",
      "the valve is stuck"
    ],
    "aliases": [
      "bone char",
      "carbon fines",
      "black fines",
      "black grit",
      "black sediment",
      "gold+",
      "gold plus",
      "contaminated resin",
      "jammed valve",
      "stuck valve",
      "carbon in softener",
      "media bleed",
      "fines"
    ],
    "facts": [
      "Bone char carbon media consistently bleeds fines. This is a known issue on our side \u2014 not a customer install error to argue about.",
      "Carbon fines in a softener resin bed do NOT contaminate it. Carbon and resin are commonly blended in the industry.",
      "Fines can jam the valve head. When that happens, valve repair or replacement is SoftPro's responsibility.",
      "A small-micron sediment filter downstream of the carbon unit catches the fines. We were not specifying this, and should be.",
      "Bleed is worse when the carbon wasn't soaked, or wasn't flushed/backwashed long enough before being put into service."
    ],
    "troubleshootingSteps": [
      "Confirm the unit is a carbon/bone char system and the grit is black and fine.",
      "Reassure on the resin: blended carbon and resin is normal and the softener is not ruined.",
      "Ask whether the valve is cycling and metering normally.",
      "If the valve is jammed or erratic, authorize repair or replacement \u2014 this is ours. No approval needed.",
      "Recommend a small-micron sediment filter downstream of the carbon unit and explain why.",
      "Ask how long the carbon was backwashed at startup \u2014 it tells you whether more flushing will settle it."
    ],
    "suggestedResponse": "That black grit is carbon fines from the bone char media, and it's something we've confirmed on our end \u2014 it isn't anything you did wrong on the install. Two things worth knowing: fines that reach the softener don't harm the resin bed at all, carbon and resin are routinely blended in this industry. But fines can get into the valve, and if yours isn't cycling right, that's on us to fix \u2014 I'll get that handled. Going forward the fix is a small-micron sediment filter downstream of the carbon unit to catch the bleed, and a good long backwash at startup.",
    "dontDo": [
      "Don't tell the customer their resin is contaminated. It isn't, and saying so turns a valve fix into a full-system replacement demand.",
      "Don't blame the install as the opening move \u2014 the media bleeds regardless."
    ],
    "policyReferences": [],
    "source": "Bone char fines position \u2014 ref order #5304",
    "lastConfirmed": "Aug 13, 2026",
    "knownGap": false
  },
  {
    "id": "missingpart",
    "slug": "missingpart",
    "title": "Part missing from the box and the customer already paid a plumber",
    "category": "product",
    "authority": "escalate",
    "customerPhrases": [
      "The upper basket wasn't in there",
      "my plumber installed it anyway and now there's media in my lines",
      "I want my labor reimbursed"
    ],
    "aliases": [
      "missing part",
      "upper basket",
      "no basket",
      "plumber",
      "labor",
      "reimburse",
      "cleanup",
      "installed anyway",
      "media in lines",
      "carbon in plumbing",
      "invoice",
      "warehouse shipped wrong"
    ],
    "facts": [
      "Precedent case: warehouse shipped a carbon filter with no upper basket, a licensed plumber installed it anyway, carbon migrated into the customer's lines, and the plumber invoiced $500 for cleanup.",
      "The install guide pictures the upper basket during the install steps but never states outright that it must be installed.",
      "Position taken: shared responsibility \u2014 offered $250, half the plumber's invoice.",
      "Both sides carry some fault. The part was missing from us; a licensed plumber proceeding with a visibly incomplete assembly is on them.",
      "Labor reimbursement is never an agent-level approval."
    ],
    "troubleshootingSteps": [
      "Get the plumber's actual invoice, not a verbal number.",
      "Get photos of the affected plumbing and confirm what part was missing.",
      "Confirm with the warehouse what shipped.",
      "Send the missing part immediately \u2014 that piece needs no approval and shouldn't wait on the money conversation.",
      "Route the labor claim to Heather or Justin with the invoice attached. Do not name a figure to the customer."
    ],
    "suggestedResponse": "I'm sorry \u2014 that part should have been in the box, and I'm getting one out to you today so you're not waiting on it. On the plumber's cleanup invoice, I want to get you a real answer rather than a guess, so I'm bringing it to our operations lead with your invoice attached and I'll come back to you on it. Can you send me the itemized invoice and a couple of photos of what had to be cleaned out?",
    "dontDo": [
      "Never quote a reimbursement number yourself. The 50% precedent is guidance for management, not an agent offer.",
      "Don't delay shipping the missing part while the labor question is open."
    ],
    "policyReferences": [],
    "source": "Missing upper basket claim",
    "lastConfirmed": "Jul 24, 2026",
    "knownGap": false
  },
  {
    "id": "meter",
    "slug": "meter",
    "title": "SoftPro Elite is not metering \u2014 no flow rate on screen",
    "category": "tech",
    "authority": "resolve",
    "customerPhrases": [
      "It's not registering water use",
      "no flow rate showing",
      "it regenerates on its own schedule",
      "gallons aren't counting down"
    ],
    "aliases": [
      "meter",
      "not metering",
      "no flow rate",
      "flow rate",
      "not registering",
      "gallons",
      "impeller",
      "meter cable",
      "magnet",
      "regen",
      "won't count",
      "not counting water",
      "metering"
    ],
    "facts": [
      "Two failure points, in order of likelihood: a de-charged meter cable, then debris in the impeller. An actually faulty cable is rare.",
      "City-water SoftPro Elite units are upflow. The private well version is downflow \u2014 inlet and outlet are on opposite sides, so every bypass handle direction below is exactly reversed on a well unit.",
      "The magnet test is diagnostic and often curative at the same time \u2014 dragging the tip over a magnet resets the charge on the cable."
    ],
    "troubleshootingSteps": [
      "PART 1 \u2014 cable test. Trace the gray meter cable from the back of the unit to its plug behind the bypass assembly. Push up on the cable tip from underneath to release it, pull it out, then drag the tip back and forth across a refrigerator magnet while watching the top of the screen for a flow rate.",
      "If a flow rate registers: the cable is fine. Plug it back in. The magnet pass usually resets the charge and running water restores readings from then on. This fixes it most of the time \u2014 stop here and have them run water to confirm.",
      "If nothing registers at all on the magnet: likely a faulty meter cable. Rare, but replaceable \u2014 send one.",
      "PART 2 \u2014 bypass and regen (cable registered but still not metering). Bypass the unit: inlet red handle counterclockwise, outlet red handle clockwise. (Reversed on a well/downflow unit.) Hold MENU until it beeps, tap MENU once so Date and Time highlights, DOWN arrow to Manual Regeneration, press SET, UP/DOWN to Regen Now.",
      "City-water unit goes to Brine Draw first. Once it counts down, hold any key 3 seconds to advance to Backwash or Rinse (either is fine), let it run 2\u20133 minutes, then keep holding any key 3 seconds to step through until the display reads 'Returning to Service'. A well unit starts in Backwash instead \u2014 same idea: run a few minutes, cycle forward until 'Returning to Service'.",
      "PART 3 \u2014 impeller inspection. Pull the two large red clips closest to the back of the valve, nearest the inlet/outlet stickers. Pop the bypass out of the back of the valve. Look into the outlet side at the impeller \u2014 it must spin nice and free. If it doesn't, debris is stuck and that's what's causing the improper metering.",
      "PART 4 \u2014 impeller cleaning. Test the spin with a small flathead screwdriver. If it's not free, grip the black prong cover in front of the white impeller with needle-nose pliers and pull it straight out. Remove the white impeller, clean it under water, wipe the seat with a wet towel and run a finger around it checking for debris.",
      "PART 5 \u2014 reassembly. Seat the impeller back in its housing, press the black prong cover back in, reinsert the bypass into the back of the valve and push it fully home, replace both red clips. Return to service: inlet red handle CLOCKWISE, outlet red handle COUNTERCLOCKWISE (reverse of the bypass step \u2014 and reversed again on a well unit). Run water, check every bypass and valve connection for leaks, and confirm a flow rate appears at the top of the screen."
    ],
    "suggestedResponse": "Before we do anything else, let's try the quickest fix \u2014 it solves this most of the time. Find the gray meter cable running from the back of the unit down to where it plugs in behind the bypass. Push up on the tip from underneath to pop it loose and pull it out. Now take a refrigerator magnet and drag the cable tip back and forth across it while you watch the top of the display. Tell me if you see a flow rate number appear.",
    "dontDo": [
      "Don't jump to sending a meter cable. A genuinely bad cable is rare and the magnet pass usually fixes it.",
      "Don't give bypass handle directions without first establishing city water vs. private well \u2014 they're opposite."
    ],
    "policyReferences": [],
    "source": "Meter diagnostic procedure (confirmed end to end)",
    "lastConfirmed": "Jul 29, 2026",
    "knownGap": false
  },
  {
    "id": "tds",
    "slug": "tds",
    "title": "\u201cMy TDS meter reads the same after the carbon filter\u201d",
    "category": "tech",
    "authority": "resolve",
    "customerPhrases": [
      "The TDS didn't drop",
      "my meter says it's not working",
      "I still get 300 ppm"
    ],
    "aliases": [
      "tds",
      "tds meter",
      "ppm",
      "total dissolved solids",
      "didn't drop",
      "same reading",
      "meter says",
      "not filtering",
      "hardness reading",
      "test meter"
    ],
    "facts": [
      "A TDS meter measures dissolved ionic content. Catalytic carbon targets chlorine, chloramine, taste and odor \u2014 none of which move a TDS reading meaningfully.",
      "A softener exchanges calcium and magnesium for sodium. That's an exchange, not a removal \u2014 TDS stays roughly flat by design.",
      "So an unchanged TDS number is the expected result, not evidence of a failed unit.",
      "The customer isn't being unreasonable \u2014 TDS meters are sold as general water-quality testers, which is misleading."
    ],
    "troubleshootingSteps": [
      "Ask what the reading is before and after. Confirm they're testing at the right tap.",
      "Explain what the meter actually measures versus what the unit actually does.",
      "Point them at the test that does show the unit working: a hardness test for a softener, or a chlorine test for carbon.",
      "Link the relevant knowledge base article rather than retyping it."
    ],
    "suggestedResponse": "That reading is actually what I'd expect, and it doesn't mean anything is wrong with your system. A TDS meter reads dissolved ionic content \u2014 carbon filtration targets chlorine, chloramine, taste and odor, which barely register on TDS at all. And on the softening side, the process exchanges calcium and magnesium for sodium, so the dissolved total stays about the same by design. The test that will actually show you it's working is a hardness test kit for the softener, or a chlorine test strip on the carbon. Want me to point you at the right one?",
    "dontDo": [
      "Don't tell them their meter is 'junk.' Explain what it measures instead.",
      "Don't promise a TDS drop after any adjustment. There won't be one."
    ],
    "policyReferences": [],
    "source": "TDS misconception handling",
    "lastConfirmed": "Jul 24, 2026",
    "knownGap": false
  },
  {
    "id": "installer",
    "slug": "installer",
    "title": "Customer wants an installer referral",
    "category": "tech",
    "authority": "escalate",
    "customerPhrases": [
      "Do you have someone who can install this?",
      "can you recommend a plumber near me?"
    ],
    "aliases": [
      "installer",
      "install help",
      "plumber referral",
      "who can install",
      "recommend installer",
      "find a plumber",
      "installation service",
      "local installer"
    ],
    "facts": [
      "There is no installer referral list. This has been flagged as an open gap for nine-plus reporting periods.",
      "Do not improvise a recommendation. Naming a plumber we haven't vetted creates liability if the install goes wrong.",
      "Until a list exists, this is an honest 'we don't, here's what to ask for' answer."
    ],
    "troubleshootingSteps": [
      "Tell them plainly that we don't maintain a referral list.",
      "Give them what to ask a local plumber for, so the call goes well: a licensed plumber comfortable with whole-house water treatment, and the unit's inlet/outlet configuration.",
      "Offer the install guide and to be on the phone with their plumber during the install if it helps.",
      "Log the request. Volume on this is what will finally get the list built."
    ],
    "suggestedResponse": "We don't keep a referral list of installers, so I don't want to point you at someone I can't vouch for. What I'd look for is a licensed plumber who's comfortable with whole-house water treatment \u2014 most residential plumbers are. I'll send you the install guide so you can share it with them ahead of time, and if it's useful, I'm happy to be on the phone with your plumber during the install to walk through anything on the valve.",
    "dontDo": [
      "Don't name a plumber you found online. That becomes our recommendation.",
      "Don't say 'let me find someone in your area' unless you actually will."
    ],
    "policyReferences": [],
    "source": "Open operational gap \u2014 flagged 9+ periods",
    "lastConfirmed": "Sep 10, 2026",
    "knownGap": true
  },
  {
    "id": "return",
    "slug": "return",
    "title": "Customer wants to return a unit",
    "category": "money",
    "authority": "judge",
    "customerPhrases": [
      "I want to send it back",
      "this isn't what I need",
      "how do I return it?"
    ],
    "aliases": [
      "return",
      "send it back",
      "rga",
      "rma",
      "return authorization",
      "restocking",
      "return shipping",
      "refund the unit",
      "don't want it",
      "cancel after delivery"
    ],
    "facts": [
      "Restocking fee is charged because the warehouse charges us one. It is a real cost, not a penalty.",
      "Original outbound shipping and return shipping are the customer's responsibility \u2014 these are large, expensive-to-ship items.",
      "Returns can be picked up on SoftPro's own freight account, which costs the customer significantly less than arranging return shipping themselves. Lead with this.",
      "RGAs are numbered SP-RGA-YYYYMMDD-NN and run through SOP-CS-RGA-001.",
      "The return policy is posted on the website only. Customers do not affirmatively agree to it at checkout \u2014 never claim they did."
    ],
    "troubleshootingSteps": [
      "Find out why. A sizing or expectation problem may be solvable without a return \u2014 and a solved problem beats a restocking fee for everyone.",
      "If the return stands, lay out the three costs plainly up front: restocking, original outbound, return freight. Surprises here become chargebacks.",
      "Offer pickup on our freight account and tell them it's cheaper than what they'd arrange themselves.",
      "Issue the RGA under the standard numbering and log it.",
      "If they push back hard on the fees, see the return-fee complaint entry before conceding anything."
    ],
    "suggestedResponse": "I can set that up for you. So you know the full picture before we start: there's a restocking fee our warehouse charges us on returns, and original outbound and return freight are the customer's responsibility \u2014 these tanks are heavy enough that shipping is a real number. The good news is I can arrange the pickup on our own freight account, which will cost you meaningfully less than booking a return freight carrier yourself. Before I generate the return authorization though \u2014 can you tell me what's not working about it? Sometimes it's a sizing question we can fix.",
    "dontDo": [
      "Never say the customer agreed to the return policy at checkout. There is no checkout checkbox \u2014 this is exactly the claim that loses a chargeback.",
      "Don't quote a return freight figure you haven't confirmed."
    ],
    "policyReferences": [],
    "source": "Returns / RGA system \u2014 SOP-CS-RGA-001",
    "lastConfirmed": "Jul 23, 2026",
    "knownGap": false
  },
  {
    "id": "returnfee",
    "slug": "returnfee",
    "title": "Customer is angry about return fees",
    "category": "money",
    "authority": "judge",
    "customerPhrases": [
      "You're charging me to send back your own product?",
      "this is a scam",
      "I'll dispute it"
    ],
    "aliases": [
      "restocking fee",
      "fee complaint",
      "angry about fees",
      "charging me",
      "rip off",
      "scam",
      "dispute it",
      "chargeback threat",
      "unfair fee",
      "won't pay fee",
      "waive the fee"
    ],
    "facts": [
      "Resolved precedent: waived the restocking fee, charged a flat amount below actual freight cost, and arranged pickup on the company account.",
      "We are under a Shopify Payments reserve hold from elevated chargebacks. Chargeback prevention outranks policy enforcement in borderline cases.",
      "The return policy is posted on the website only, with no checkout acknowledgement \u2014 our enforcement position is weaker than it feels.",
      "The moment 'dispute' or 'chargeback' is said out loud, the math changes. A concession is cheaper than a dispute."
    ],
    "troubleshootingSteps": [
      "Do not defend the fee structure line by line. It escalates.",
      "Acknowledge that the total feels like a lot on a product they're sending back. It does.",
      "Reach for the precedent package: waive restocking, charge a flat below-cost freight number, arrange pickup on our account.",
      "Stay inside your authority ceiling. Above it, escalate \u2014 but escalate fast, this is time-sensitive.",
      "Get their agreement in writing on the ticket before processing."
    ],
    "suggestedResponse": "I hear you, and I'm not going to argue the fee structure with you. Here's what I can do: I'll waive the restocking fee entirely, arrange the pickup on our freight account so you're not booking a carrier, and charge you a flat [amount] for the freight \u2014 which is less than what it actually costs us to move it. That's the best version of this I can put together, and I'd rather get you sorted than have this drag out.",
    "dontDo": [
      "Don't threaten the policy back at them.",
      "Don't let it sit overnight. A stalled fee complaint becomes a chargeback."
    ],
    "policyReferences": [],
    "source": "Return-fee complaint resolution + chargeback strategy",
    "lastConfirmed": "Aug 25, 2026",
    "knownGap": false
  },
  {
    "id": "chargeback",
    "slug": "chargeback",
    "title": "Chargeback filed, or customer says they're disputing the charge",
    "category": "money",
    "authority": "escalate",
    "customerPhrases": [
      "I've contacted my bank",
      "I'm disputing it",
      "my credit card company is handling it"
    ],
    "aliases": [
      "chargeback",
      "dispute",
      "bank",
      "credit card company",
      "disputing",
      "reversed the charge",
      "filed a dispute",
      "card issuer",
      "reserve",
      "payment dispute"
    ],
    "facts": [
      "We are under a Shopify Payments reserve hold caused by elevated chargebacks. Every additional dispute makes that worse.",
      "Shopify blocks issuing refunds or credits against an order while a chargeback on it is open. If the customer is owed money mid-dispute, you cannot pay them through the order.",
      "That constraint recurs constantly and confuses customers \u2014 they think we're refusing to refund.",
      "Chargeback prevention takes priority over policy enforcement in borderline cases."
    ],
    "troubleshootingSteps": [
      "If they've said they're GOING to dispute but haven't yet: this is still preventable. Treat it as urgent, resolve within your authority now, and escalate immediately if it's above your ceiling.",
      "If the dispute is already FILED: stop. Do not promise a refund \u2014 Shopify will not let you issue one against that order.",
      "Escalate to Heather the same day with the order number, the full thread, and what the customer says they want.",
      "Keep responding to the customer. Silence during a dispute is what makes the bank rule against us.",
      "Assemble evidence on the ticket: tracking and delivery confirmation, photos, every message where we offered a resolution."
    ],
    "suggestedResponse": "I understand, and I'd still like to get this resolved directly with you. One thing worth knowing: once a dispute is opened with your bank, our payment system locks the order and I'm not able to issue a refund or credit against it even if I want to \u2014 the bank's process takes over. So if there's a version of this I can fix for you today, I'd much rather do that. Tell me what outcome you're looking for and I'll take it to our operations lead right now.",
    "dontDo": [
      "Never promise a refund on an order with an open chargeback. You physically cannot deliver it.",
      "Don't go quiet. Non-response is how disputes are lost.",
      "Don't argue policy with someone mid-dispute."
    ],
    "policyReferences": [],
    "source": "Chargeback strategy under Shopify reserve hold",
    "lastConfirmed": "Aug 25, 2026",
    "knownGap": false
  },
  {
    "id": "sizing",
    "slug": "sizing",
    "title": "\u201cThe system you sold me is the wrong size\u201d",
    "category": "money",
    "authority": "judge",
    "customerPhrases": [
      "It's too small for my house",
      "it regenerates constantly",
      "I was sold the wrong unit"
    ],
    "aliases": [
      "sizing",
      "wrong size",
      "too small",
      "undersized",
      "oversized",
      "grain",
      "48000",
      "regenerates too often",
      "hardness",
      "family of five",
      "wrong system",
      "mis-sold"
    ],
    "facts": [
      "Sizing complaints have gone to dispute before \u2014 including one on a 48,000-grain upflow softener. Treat these as chargeback-sensitive from the first message.",
      "Get real numbers before conceding anything: hardness in gpg, iron, household size, fixture count, and how often it's actually regenerating.",
      "Frequent regeneration is not automatically undersizing \u2014 it can be a settings or metering issue. Check the meter entry first.",
      "If the unit truly is undersized for the water, that's a sizing error on our side and needs management."
    ],
    "troubleshootingSteps": [
      "Collect the numbers: hardness, iron, people in the home, and observed regeneration frequency.",
      "Rule out a metering or settings cause before accepting the sizing premise.",
      "If the specs confirm undersizing, escalate \u2014 the resolution (upsize, partial credit, exchange) is above agent level.",
      "Whatever the answer, respond fast. These escalate to disputes quickly."
    ],
    "suggestedResponse": "Let's get to the bottom of it with actual numbers rather than guessing. Can you tell me your water hardness in grains per gallon, whether there's iron in the water, how many people are in the house, and how often the unit is currently regenerating? Sometimes what looks like an undersized system is a settings or metering issue we can correct, and sometimes the numbers show we sized it wrong \u2014 either way I want to know which one this is before I tell you anything.",
    "dontDo": [
      "Don't concede 'yes, that's undersized' before you have the hardness number.",
      "Don't let a sizing complaint sit in the queue."
    ],
    "policyReferences": [],
    "source": "Chargeback-sensitive dispute handling",
    "lastConfirmed": "Aug 25, 2026",
    "knownGap": false
  },
  {
    "id": "competitor",
    "slug": "competitor",
    "title": "\u201cWhy should I buy this over SpringWell / US Water / Aquasure?\u201d",
    "category": "sales",
    "authority": "resolve",
    "customerPhrases": [
      "SpringWell is cheaper",
      "how does this compare to the Matrixx?",
      "what makes yours better"
    ],
    "aliases": [
      "springwell",
      "us water",
      "matrixx",
      "aquasure",
      "harmony",
      "competitor",
      "compare",
      "versus",
      "vs",
      "cheaper elsewhere",
      "why yours",
      "comparison"
    ],
    "facts": [
      "There is a competitive buyer's guide covering SoftPro Elite against SpringWell, US Water Matrixx, and Aquasure Harmony.",
      "Two versions exist: an internal sales breakdown, and a customer-facing document you can send.",
      "Send the customer-facing version. Don't paraphrase the internal one."
    ],
    "troubleshootingSteps": [
      "Find out what they're actually comparing on \u2014 price, capacity, warranty, or efficiency. The answer differs.",
      "Use the internal breakdown to frame your answer.",
      "Send the customer-facing buyer's guide document.",
      "If it's a sales-track call, route it to Jeremy or Christine rather than handling it as a service call."
    ],
    "suggestedResponse": "Happy to give you a straight comparison rather than a sales pitch \u2014 we actually put together a side-by-side against the units people most often shortlist alongside ours, and I'll send it over. Before I do: what's the main thing you're weighing? If it's upfront price the comparison looks one way, and if it's capacity and long-run salt and water efficiency it looks another.",
    "dontDo": [
      "Don't disparage a competitor by name without the guide's substantiation behind you.",
      "Don't send the internal sales breakdown to a customer."
    ],
    "policyReferences": [],
    "source": "Competitive buyer's guide",
    "lastConfirmed": "Jul 17, 2026",
    "knownGap": false
  },
  {
    "id": "orderstatus",
    "slug": "orderstatus",
    "title": "\u201cWhere is my order?\u201d",
    "category": "sales",
    "authority": "resolve",
    "customerPhrases": [
      "No tracking yet",
      "it's been a week",
      "has it shipped?"
    ],
    "aliases": [
      "order status",
      "where is my order",
      "tracking",
      "hasn't shipped",
      "when will it ship",
      "shipping update",
      "no tracking",
      "delayed order",
      "eta"
    ],
    "facts": [
      "A written phone script exists for this call type \u2014 SOP-CS-SCRIPTS-001 covers order status alongside angry/late-order retention, freight damage, technical troubleshooting, sizing, returns/RGA, install help, warranty, pre-purchase, voicemail, and IVR-loop recovery.",
      "Order status calls are the highest-volume reason customers call. Handling them cleanly is what keeps the queue moving.",
      "There is no expedited option to offer if it's late. Do not open that door."
    ],
    "troubleshootingSteps": [
      "Pull the order in Shopify and check fulfillment status before you say anything.",
      "If tracking exists, give the number and the carrier's own estimate \u2014 not your guess.",
      "If it hasn't shipped, give the honest reason and a real next checkpoint, then own the follow-up rather than making them call back.",
      "If they're angry about a delay, switch to the retention script in SOP-CS-SCRIPTS-001.",
      "Set a follow-up on the ticket. Unowned status tickets are how the backlog grows."
    ],
    "suggestedResponse": "Let me pull that up. [Confirm status.] Here's exactly where it stands \u2014 [status] \u2014 and the carrier's estimate is [date]. I'm going to set a reminder on my side to check it again on [date], and if anything changes before then you'll hear from me rather than the other way round.",
    "dontDo": [
      "Don't say 'it should ship soon' without a checkpoint date.",
      "Don't offer to expedite a late order. That option doesn't exist."
    ],
    "policyReferences": [],
    "source": "SOP-CS-SCRIPTS-001",
    "lastConfirmed": "Sep 10, 2026",
    "knownGap": false
  }
];
