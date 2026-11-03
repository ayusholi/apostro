import type { AssistSuggestion } from "@/types/workspace";

/**
 * Canned "Assist" output for the prototype. Nothing here is generated at
 * runtime and no AI service is connected. The wording sticks to facts in
 * the mock record and administrative suggestions. It gives no legal advice,
 * makes no conclusions, and leaves gaps for the fee earner to fill.
 */
export const conversationAssist: Record<string, AssistSuggestion> = {
  okafor: {
    basedOn: "3 messages in this thread and matter PRO/0142",
    summary:
      "Amara asks two things: whether exchanging within about three weeks is realistic (the seller asked via the estate agent), and whether anything in the searches should concern her. Her broker expects the mortgage offer this week. She is still waiting for your report on the local authority search.",
    draftReply:
      "Hi Amara,\n\nThanks for your message. Exchanging within three weeks may be possible, but it depends on receiving your mortgage offer and on finishing my review of the searches and the seller’s replies to our enquiries, which arrived this morning.\n\nI’m reviewing the local authority search today and will send you my report by [add date]. Once your offer arrives I’ll check its conditions and confirm a realistic timetable.\n\nWe can talk it through on our call at 11:00.\n\nBest wishes,\nPriya",
  },
  whitmore: {
    basedOn: "3 messages in this thread and matter WIL/0311",
    summary:
      "Ruth asks whether her sister can be appointed guardian while James’s brother manages the children’s money. She also confirms the Thursday 10am signing appointment.",
    draftReply:
      "Hi Ruth, thanks — that’s a good question and a common one. I’d like to go through the options with you both properly rather than by message. Could we take 15 minutes before Thursday’s appointment, or at the start of it? If the drafts need changing we can update them before you sign. Priya",
  },
  reid: {
    basedOn: "1 website enquiry",
    summary:
      "Prospective client. Reports that a neighbour’s new fence sits about 0.5 m onto his garden. He holds a plan from his 2019 purchase. The neighbour won’t discuss it. He asks whether we can help and what advice would cost, and prefers a phone call after 5pm.",
    missing: [
      "Property address",
      "Neighbour’s name and address (needed for the conflict check)",
      "Copy of the 2019 plan or title documents",
    ],
    draftReply:
      "Dear Mr Reid,\n\nThank you for contacting Harlow Reyes Solicitors about your boundary. Before we can advise, we need to run a conflict check — could you send the property address and your neighbour’s name and address?\n\nI’ll call you after 5pm on [add date] to explain how we can help and our fees for an initial consultation.\n\nKind regards,\nSaul Goodman",
  },
  begum: {
    basedOn: "1 WhatsApp message",
    summary: "Prospective client referred by a family member. Wants a will; owns a house and has two children. Asks about cost and whether she must attend in person.",
    missing: ["Full name and address", "Whether the house is jointly owned", "Preferred appointment times"],
    draftReply:
      "Hello Mrs Begum, thank you for getting in touch. We’d be happy to help with your will. I’ll send our fixed-fee information shortly. Could you share your full address and a couple of times that suit you for a short call? Priya, Harlow Reyes Solicitors",
  },
  hollis: {
    basedOn: "1 email with 2 attachments",
    summary:
      "The seller’s solicitors sent replies to pre-contract enquiries and a FENSA certificate for the rear windows. They say their client wants to agree a timetable for exchange. The replies note that the building regulations certificate for the dormer is “to follow”.",
  },
  northgate: {
    basedOn: "1 email",
    summary:
      "Mark reports an informal call from Castlebrook’s site manager suggesting a settlement if interest is dropped. Nothing has been offered in writing. He asks how to respond to any further calls.",
  },
  hale: {
    basedOn: "1 email with 1 attachment",
    summary: "Simon has sent the bank’s date-of-death valuation for his mother’s accounts and offers to provide anything else needed.",
  },
  kowalczyk: {
    basedOn: "2 messages",
    summary: "Lena asked whether she must agree to the father having the children for all of half term. Helen asked her not to agree anything in writing and arranged a call.",
  },
  hassan: { basedOn: "2 messages", summary: "Yusuf confirmed the signed transfer deed was posted; the firm acknowledged receipt." },
};

export const matterAssist: Record<string, AssistSuggestion> = {
  "pro-0142": {
    basedOn: "the last 14 days of activity, 4 documents and 2 open tasks",
    summary:
      "Searches came back five days ago and the local authority search is waiting for review. Amara chased for an update and was told a report is coming. The broker expects the mortgage offer this week. This morning Hollis & Co sent replies to enquiries and a FENSA certificate, and passed on the seller’s wish to agree an exchange timetable.",
    missing: [
      "No mortgage offer on file",
      "No source-of-funds evidence for the deposit found in documents",
      "Building regulations certificate for the dormer marked “to follow” in replies",
    ],
    nextSteps: [
      "Report on the local authority search to Amara",
      "Review replies to enquiries and raise any further enquiries",
      "Request source-of-funds evidence from Amara",
    ],
  },
  "civ-0219": {
    basedOn: "the last 30 days of activity and 3 documents",
    summary:
      "Letter before claim sent two weeks ago for £18,450. No written response. Client reports an informal call from Castlebrook proposing settlement if interest is waived. A chaser has been drafted by Tom and is awaiting review.",
    missing: ["No written record of the informal call (attendance note)", "Signed contract or purchase orders not found in documents"],
    nextSteps: ["Record an attendance note of the client’s report", "Review and send the chaser letter", "Ask client for the signed contract or purchase orders"],
  },
  "wil-0311": {
    basedOn: "the last 40 days of activity",
    summary: "Drafts sent five days ago. Ruth has asked about splitting guardianship and trusteeship. Signing booked for Thursday at 10am. The drafting-meeting attendance note is still to be written.",
    missing: ["Attendance note for drafting meeting", "Guardian’s full name and address"],
    nextSteps: ["Reply to Ruth about guardianship", "Write up drafting-meeting attendance note"],
  },
  "pro-0139": {
    basedOn: "the last 7 days of activity",
    summary: "Exchanged last week. Signed transfer deed received. Completion statement drafted but the seller’s lender has not yet given a redemption figure.",
    missing: ["Redemption figure from seller’s lender"],
    nextSteps: ["Chase redemption figure", "Send completion statement once figure is received"],
  },
  "fam-0087": {
    basedOn: "the last 30 days of activity",
    summary: "Application issued and first hearing listed. Client asked about half-term arrangements; Helen arranged a call.",
    nextSteps: ["Record outcome of Monday call with Lena", "Begin position statement"],
  },
  "prb-0056": {
    basedOn: "the last 60 days of activity",
    summary: "Asset letters sent; bank valuation now received. IHT figures need confirming with the executor. Executor ID check is still outstanding.",
    missing: ["Executor ID verification", "Household contents valuation"],
    nextSteps: ["Call Simon to confirm figures", "Request ID documents from Simon"],
  },
};
