import { Metadata } from 'next';
import BlogPost from '@/components/blog/BlogPost';
import { getFeaturedCoupons, getFeaturedStores } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Laid Off Twice, Then I Built My Own Income Stream on the Side',
  description: 'A founder story: after surviving multiple layoffs, I learned that everyone needs a skill outside their day job. Here is the full story of how I built CouponMia on the side, the mistakes I made, the tools I used, and a step-by-step plan you can copy.',
  keywords: 'side hustle, layoff, career transition, solo founder, building in public, side project, financial freedom, indie hacker',
};

export default async function LaidOffSideProjectPage() {
  const featuredCoupons = await getFeaturedCoupons(6);
  const featuredStores = await getFeaturedStores(8);

  const articleData = {
    title: "Laid Off Twice, Then I Built My Own Income Stream on the Side",
    publishDate: "August 27, 2026",
    readTime: "15 min read",
    author: "CouponMia Founder",
    category: "Career & Side Income",
    featuredImage: "/api/placeholder/1200/630",
    excerpt: "After going through several rounds of layoffs, I stopped believing that 'just doing a good job' was enough to keep me safe. This is the full story of how I built CouponMia in my spare time, the excuses I had to get past, the mistakes I made, the tools I actually used, and a practical plan anyone can copy.",
    tableOfContents: [
      { id: "introduction", title: "Why 'Just Do A Good Job' Stopped Being Enough" },
      { id: "the-real-lesson", title: "The Real Skill Layoffs Taught Me" },
      { id: "the-excuses", title: "The Excuses That Almost Stopped Me" },
      { id: "timeline", title: "The Actual Timeline, Month By Month" },
      { id: "how-it-started", title: "How I Started Building On The Side" },
      { id: "tools", title: "The Tools And Stack I Actually Used" },
      { id: "six-steps", title: "6 Steps To Build Your Own Solo Capability" },
      { id: "mistakes", title: "Mistakes I Made (So You Don't Have To)" },
      { id: "what-the-numbers-looked-like", title: "What The Numbers Actually Looked Like" },
      { id: "faq", title: "Questions People Ask Me About This" },
      { id: "first-30-days", title: "Your First 30 Days, Week By Week" },
      { id: "conclusion", title: "The Point Was Never The Money" }
    ],
    content: `
# Why "Just Do A Good Job" Stopped Being Enough {#introduction}

For most of my career, I believed something pretty simple: if you work hard and do good work, your job is safe. I showed up early, I delivered on time, I made my manager's life easier, and I figured that was the whole game. Do good work, get rewarded, repeat.

Then I went through a round of layoffs. Not because my work was bad. My reviews were fine. It was a budget line item, decided in a meeting I wasn't in, for reasons that had nothing to do with whether I was good at my job.

I told myself it was a one-time thing, bad luck, the wrong company at the wrong time. So I found another job, worked just as hard, and kept my head down again.

Then it happened a second time.

That second layoff is the one that actually changed how I think. Because by then the pattern was obvious: **being good at your job and being secure in your job are two completely different things.** Security doesn't come from how hard you work for someone else. It comes from what you're capable of building on your own, without needing anyone's approval to start.

That realization is the entire reason CouponMia exists.

---

# The Real Skill Layoffs Taught Me {#the-real-lesson}

Here's what took me an embarrassingly long time to admit: the skill I was missing wasn't a technical one. I could already write code, or write copy, or manage a project, depending on what job I happened to have. What I couldn't do was take an idea from "nothing" to "something a stranger uses and maybe pays for," entirely on my own, with no team, no budget, and no one telling me what to do next.

Most jobs make you a specialist. You own one slice of the pipeline; the design, or the backend, or the ad spend, or the customer emails, and someone else owns the rest. That's efficient for a company. It is genuinely great for productivity. But it also means most people have never had to close the entire loop themselves: find the problem, build the fix, tell someone it exists, and convince them to try it.

If you've never done that loop start to finish, you don't actually know whether you can survive without an employer standing between you and the market. I didn't know either. So instead of assuming, I decided to test it, on the side, without quitting my job.

---

# The Excuses That Almost Stopped Me {#the-excuses}

Before I get to what I actually did, I want to be honest about how long I sat on this idea doing nothing, because of a handful of excuses that felt completely reasonable at the time.

**"I don't have enough time."** I had a full-time job and a life outside it, same as everyone. What changed wasn't my schedule, it was that I stopped treating side-project time as a "someday" activity and started treating it like a recurring meeting I couldn't skip, even if it was only 45 minutes some nights.

**"Someone already built this."** Coupon and deal sites already existed, plenty of them, some run by huge companies. I almost didn't start because of that. What I eventually realized is that "someone already built this" is true of almost every good idea, and it says nothing about whether there's still room for a version built by one focused person who actually uses the product.

**"I need to learn X first."** I told myself I needed to get better at design, or SEO, or backend architecture, before I was "ready." In practice, the fastest way to learn any of those was to be forced to use them on a real, live project with real users, not to study them in the abstract first.

**"I should wait until I have more savings / more free time / less stress."** There is never a perfect moment. Waiting for ideal conditions is usually just a comfortable way to avoid starting.

**"What if it fails and I wasted the time?"** This is the one that actually mattered, and the honest answer is: the skill you build by going through the whole loop once doesn't disappear even if that specific project fails. The confidence that you can do it again is the actual asset.

---

# The Actual Timeline, Month By Month {#timeline}

People tend to picture side projects as either "overnight success" or "years of grinding in the dark." Mine was neither. Here's roughly how it actually went, in the interest of being useful rather than inspiring.

**Months 1-2: Deciding on the idea, badly at first.** I initially tried to plan something far too ambitious; a whole shopping-comparison platform with features I had no business building alone. I wasted a few weekends on a spec document nobody would ever read. Eventually I cut it down to one narrow, boring problem: help people find a working coupon code before they check out, without twelve open browser tabs.

**Months 2-4: Building the smallest usable version.** Evenings and weekends. No new frameworks I hadn't touched before, no reinventing anything I didn't have to. The first version had one store category, ugly styling, and coupons I added by hand.

**Months 4-5: Showing it to actual strangers.** This was the most uncomfortable part. I posted it in a couple of relevant online communities, sent a handful of direct messages, and watched real people use something I built for the first time. Some of the early feedback was blunt. All of it was useful.

**Months 5-8: Fixing the one thing people actually complained about.** Not every complaint, the recurring one. In my case, it was that codes were often expired or fake, which is the single most common complaint about coupon sites in general. So I built a basic verification and refresh process before adding any new features.

**Months 8-12: Slow, steady growth from search and word of mouth.** No paid ads, no viral moment. Mostly consistent, unglamorous work: adding stores, writing useful content, fixing what broke, and paying attention to which pages people actually returned to.

None of this happened quickly. What made it work was that none of it required quitting my job first.

---

# How I Started Building On The Side {#how-it-started}

Over about a year, in the hours before and after my regular job, I built and grew CouponMia into something real. The idea itself wasn't groundbreaking: a coupon and deal-finding site that helps people find verified codes across thousands of stores. What mattered wasn't the idea. What mattered is that I forced myself to own every part of it, instead of only the part I was already comfortable with.

- I designed and built the product myself, learning what I didn't already know as I went.
- I wrote the copy, the store pages, and figured out basic SEO myself, one page at a time.
- I reached out to the first handful of users myself, in communities where they'd actually notice.
- I looked at the numbers every single week, myself, instead of assuming things were working.

It was slower and messier than any one of those tasks would have been at a company, where a specialist would have handled it in a fraction of the time. That friction was the entire point. Every part I struggled through by myself became a part I no longer had to be afraid of.

---

# The Tools And Stack I Actually Used {#tools}

I'm including this section because "just build it" isn't useful advice on its own. Here's roughly what the actual toolkit looked like, not as a recommendation that you use these exact tools, but as a concrete example that the stack doesn't need to be exotic.

**For the product itself:** A modern web framework (Next.js) with a hosted database (Supabase/Postgres) so I wasn't managing servers by hand. Utility-first CSS (Tailwind) so styling didn't eat evenings that should have gone to features.

**For content and data:** AI tools for drafting first-pass copy and FAQs, which I then edited by hand rather than publishing untouched. This cut a huge amount of the "blank page" time out of writing dozens of store and category pages.

**For finding deals:** An affiliate network API to pull in real, current offers, rather than trying to manually track thousands of stores by hand, which simply isn't possible for one person.

**For staying honest with myself:** A simple weekly check-in, just a note to myself with two or three numbers, traffic, new stores added, anything broken, so "how's it going" had an actual answer instead of a vague feeling.

None of this required a team, a budget, or permission from anyone. It required picking tools that let one person do the work of several, and then doing the unglamorous parts consistently.

---

# 6 Steps To Build Your Own Solo Capability {#six-steps}

If you're reading this after a layoff, or just tired of feeling one bad quarter away from one, here's the practical version of what worked for me. None of it requires quitting your job first.

## 1. Pick one skill you can monetize entirely alone
Writing, coding, design, or basic marketing; pick something where you can produce a finished, sellable result without needing a team. You're optimizing for "I can do the whole loop myself," not "I'm the best in the world at this." Competence beats mastery when you're just trying to prove you can close the loop.

## 2. Ship something small in 2 to 4 weeks
Don't plan for six months. Build the smallest version of an idea that solves one real problem for one real type of person. Use evenings and weekends, in fixed blocks rather than "whenever I feel like it." A rough version that exists beats a perfect plan that doesn't. Cut scope aggressively; if a feature isn't required to prove the core idea, it can wait.

## 3. Launch before it feels ready
Put it in front of real people while you're still a little embarrassed by it. A relevant community, a small landing page, a handful of direct messages to people who might actually care. The goal isn't a big launch moment; it's your first honest feedback, and honest feedback only comes from real users, not from friends being polite.

## 4. Learn just enough marketing to get your first 100 users
You don't need to become a marketer. You need to learn one channel well enough to bring in a small, steady trickle of people: basic SEO for a content-driven product, one relevant online community for a niche product, or direct outreach for something with a narrow target audience. Depth in one channel beats being spread thin across five you barely understand.

## 5. Learn just enough sales to get your first real "yes"
Even if there's no literal price tag, this is the moment someone chooses to use what you built instead of doing nothing, or instead of using whatever they were using before. Ask people directly why they stuck around, and just as importantly, ask the ones who left why they didn't. That conversation teaches you more than weeks of solo guessing ever will.

## 6. Keep your job until the side project earns its own trust
Don't quit on hope, quit on evidence. Let the project prove itself first, in returning users, in revenue, or at minimum in a clear, repeatable signal that people want it and come back for it. The day job isn't the obstacle here; it's the runway that lets you build without financial panic clouding every decision.

---

# Mistakes I Made (So You Don't Have To) {#mistakes}

**I over-built the first version.** I spent weeks on features nobody had asked for yet, because building felt more productive than showing an unfinished thing to strangers. It wasn't. If I started over, I'd cut the first version's scope by half and get it in front of real users at least a month earlier.

**I ignored the boring problem for too long.** Early on, expired or fake coupon codes were the single biggest complaint, and I kept deprioritizing the fix in favor of new features that felt more exciting to build. Fixing the boring, unglamorous problem people actually complained about mattered more than almost anything else I did.

**I tried to do everything at once early on.** In the first month I tried to build the product, write all the content, and figure out marketing simultaneously, and made mediocre progress on all three. Sequencing matters: get something usable built first, then content, then distribution, rather than spreading thin attention across all three from day one.

**I waited too long to ask for feedback directly.** I published pages and waited passively to see what happened, instead of proactively messaging real people and asking pointed questions. Passive launches teach you much less than direct conversations do.

**I underestimated how long "slow and steady" actually takes.** I expected a clearer, faster signal of success than I got. Growth from search and word of mouth is genuinely slow at first, and treating months four through eight as a failure, instead of as the normal early phase of a content-driven product, would have been a mistake if I hadn't kept perspective on the realistic timeline.

---

# What The Numbers Actually Looked Like {#what-the-numbers-looked-like}

I'm deliberately not going to invent precise revenue figures here, because I think confident-sounding numbers from strangers on the internet are part of what makes people feel like they're behind. What I can say honestly is this: the first few months produced close to nothing in visible traction, the middle months were slow and repetitive, and the meaningful progress showed up gradually, not as one big spike. If you're a few months into a side project and it feels like nothing is happening, that's typically not a sign you're doing it wrong. It's usually just where the timeline actually is for anything built on content and word of mouth rather than paid growth.

The number that mattered most to me wasn't revenue or traffic in isolation. It was whether the same handful of people came back a second and third time. That's the earliest honest signal that you've built something worth continuing.

---

# Questions People Ask Me About This {#faq}

**Do I need to know how to code?**
No, but you do need to be willing to learn enough of whatever skill your idea requires to get an ugly first version out the door, or be willing to trade a skill you do have for help with the one you don't.

**How many hours a week does this actually take?**
Consistency mattered more than total hours. A handful of fixed evening or weekend blocks, protected like an actual appointment, moved things forward more reliably than occasional long, unpredictable bursts of effort.

**When should I tell my employer or coworkers about it?**
That's a personal and sometimes contractual decision, check your employment agreement for any moonlighting or conflict-of-interest clauses before you start, especially if the side project is anywhere near your employer's industry.

**What if my idea turns out to be a bad one?**
Then you still walk away having closed the loop once, end to end, and that experience transfers directly to the next idea. The specific project failing and the underlying capability disappearing are two different things.

**When should I quit my day job?**
When the side project has given you real evidence, not hope, that it can replace a meaningful chunk of your income, and ideally only after you've built some financial runway on top of that.

---

# Your First 30 Days, Week By Week {#first-30-days}

If you want to start this week instead of "someday," here's the smallest realistic version.

**Week 1:** Write down one problem you personally run into that you could plausibly fix. Don't brainstorm ten ideas, pick the one that annoys you often enough that you'd use the fix yourself.

**Week 2:** Build the ugliest possible version that fixes just that one problem. No polish, no extra features, no accounts or settings unless the core idea is literally impossible without them.

**Week 3:** Show it to at least ten real people outside your own head; a relevant online community, a few direct messages, anyone who might plausibly have the problem you're solving. Ask directly what's missing or confusing, and resist the urge to explain it away.

**Week 4:** Fix the one issue that came up most often across those conversations, and make sure the thing lives somewhere people can actually find and return to, not just a link you sent once and forgot about.

That's the whole plan. No business plan, no resignation letter, no guarantee it works. Just proof, to yourself, that you can carry an idea through the entire loop alone.

---

# The Point Was Never The Money {#conclusion}

CouponMia started because two layoffs taught me, the hard way, that being good at a job and being secure are not the same thing. Building it wasn't really about replacing an income stream, even though that mattered too. It was about proving to myself that I could take something from nothing to real, on my own terms, without waiting for anyone's permission to start.

If you've been laid off, or you're just tired of feeling like your career depends entirely on decisions made in a room you're not in, I'd genuinely rather you take the excuses section above more seriously than the tools section. The tools change. The willingness to close the loop yourself, once, is the part that actually makes you harder to lay off out of your own sense of security, even if your job title never changes.
    `,
    featuredCoupons,
    featuredStores
  };

  return <BlogPost {...articleData} />;
}
