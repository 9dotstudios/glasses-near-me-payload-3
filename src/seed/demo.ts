import type { Payload } from 'payload'

import { ADD_SHOP_PATH, ADD_SHOP_SLUG } from '@/lib/routes'

import { guideLibrary } from './guideLibrary'
import { richText } from './richText'

type Block = Record<string, unknown>

const homeSeo = {
  title: 'Glasses Near Me — Find Independent Optical Shops Near You',
  description:
    'Search 1,992 independent optical shops and optometrists across Malaysia, Singapore and Australia. Real ratings, review counts and phone numbers. No pay-to-rank.',
}

const pages: Array<{ title: string; slug: string; seo: { title: string; description: string }; layout: Block[] }> =
  [
    {
      title: 'Home',
      slug: 'home',
      seo: homeSeo,
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          fullHeight: true,
          imageUrl: '/marketing/hero.jpg',
          eyebrow: 'Independent optical directory',
          heading: 'Find a good optician, not just a nearby one.',
          body: '1,992 independent optical shops and optometrists across Malaysia, Singapore and Australia — with the public rating real customers gave each one, and the phone number to call. Free to browse, no sign-up, and no shop can pay its way up the list.',
          primaryLabel: 'Browse the directory',
          primaryHref: '/find-a-shop',
          secondaryLabel: 'Read the guides',
          secondaryHref: '/guides',
        },
        {
          blockType: 'searchPrompt',
          scheme: 'scheme-1',
          heading: 'Search by town, area or shop',
          placeholder: 'Town or shop name',
          buttonLabel: 'Search',
          href: '/find-a-shop',
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'The honest version',
          heading: 'Why an independent optician',
          body: 'Not because independents are automatically better, but because you can judge one on evidence instead of on a brand.',
          columns: '4',
          items: [
            {
              icon: 'star',
              title: 'See the rating before you go',
              description:
                'Every listing carries the public star rating and the number of people who left it — the good ones and the bad ones.',
            },
            {
              icon: 'money_off',
              title: 'Nobody can pay to rank',
              description:
                'Listings are compiled from public sources. There is no advertising tier, no sponsored placement and no partner programme.',
            },
            {
              icon: 'balance',
              title: "We don't sell glasses",
              description:
                "We're not a shop and we don't take a commission, so what you pay is between you and the optician.",
            },
            {
              icon: 'call',
              title: 'Straight through to the shop',
              description:
                'Phone numbers and shop websites are listed where the shop publishes them. No booking middleman in the way.',
            },
          ],
        },
        {
          blockType: 'process',
          scheme: 'scheme-1',
          heading: 'How to use the directory',
          body: 'Three steps, and none of them need an account.',
          steps: [
            {
              label: '01',
              title: 'Find your town',
              description:
                'Choose a country, then a town. Every town page lists its shops with their public rating and review count.',
            },
            {
              label: '02',
              title: 'Compare before you call',
              description:
                'Shortlist two or three rather than taking the first result. Ratings, review counts and phone numbers sit on every listing.',
            },
            {
              label: '03',
              title: 'Call and ask three things',
              description:
                'Is the test free with a purchase? Does it include an eye-health check? What does it cost on its own? Ask all three before you book.',
            },
          ],
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'Where to look',
          heading: 'Choose a country',
          body: 'Three countries live today. Pick one to browse its towns and areas, with shop counts and public ratings on every listing.',
          columns: '3',
          variant: 'media',
          items: [
            {
              imageUrl: '/marketing/malaysia.jpg',
              title: 'Malaysia',
              description:
                '1,079 independent shops across 42 towns — from Kuala Lumpur and Petaling Jaya to Miri and Kota Bharu.',
              linkLabel: 'Browse 1,079 shops',
              linkHref: '/find-a-shop/malaysia',
            },
            {
              imageUrl: '/marketing/singapore.jpg',
              title: 'Singapore',
              description:
                '280 independent shops across 108 areas — about three shops per area, so the choice is usually local.',
              linkLabel: 'Browse 280 shops',
              linkHref: '/find-a-shop/singapore',
            },
            {
              imageUrl: '/marketing/australia.jpg',
              title: 'Australia',
              description:
                '633 independent shops across 437 areas — wide and thin, with only one or two shops in most areas.',
              linkLabel: 'Browse 633 shops',
              linkHref: '/find-a-shop/australia',
            },
          ],
        },
        {
          blockType: 'stats',
          scheme: 'scheme-2',
          centered: true,
          eyebrow: 'Live coverage',
          heading: "What's in the directory today",
          body: 'Compiled from public sources and refreshed as shops open and close. Ratings and review counts are snapshots and may change.',
          items: [
            { value: '1,992', title: 'Independent shops', description: 'Every one compiled from public sources.' },
            { value: '3', title: 'Countries covered', description: 'Malaysia, Singapore and Australia.' },
            { value: '587', title: 'Towns and areas', description: 'Town by town, not just city by city.' },
            { value: '0', title: 'Paid placements', description: 'No shop can pay to rank higher.' },
          ],
        },
        {
          blockType: 'contentFeed',
          scheme: 'scheme-4',
          eyebrow: 'Guides',
          heading: "What the price tag doesn't tell you",
          body: 'Plain-English guides to the parts of buying glasses that rarely get explained — starting with what an eye test should actually cost.',
          linkLabel: 'See all guides',
          linkHref: '/guides',
          variant: 'media',
          items: [
            {
              tag: 'Eye tests',
              imageUrl: '/marketing/guide-tests.jpg',
              title: 'How much does an eye test cost in Malaysia?',
              excerpt:
                'Many shops give a free basic test when you buy glasses. A standalone refraction commonly runs RM30–RM120, and a full eye-health check at a clinic can reach RM400.',
              href: '/guides/how-much-does-an-eye-test-cost-in-malaysia',
            },
            {
              tag: "Children's eyes",
              imageUrl: '/marketing/guide-children.jpg',
              title: 'Myopia control in children: what parents should know',
              excerpt:
                'The options that actually slow myopia progression, and the questions to ask your optometrist before you commit to any of them.',
              href: '/guides/myopia-control-in-children',
            },
            {
              tag: 'Prescriptions',
              imageUrl: '/marketing/guide-rx.jpg',
              title: 'How to read your glasses prescription',
              excerpt:
                "What SPH, CYL, AXIS and PD actually mean, in plain English — so you can read the slip you were handed and understand what you're being sold.",
              href: '/guides/how-to-read-your-glasses-prescription',
            },
          ],
        },
        {
          blockType: 'faq',
          scheme: 'scheme-1',
          eyebrow: 'Questions',
          heading: 'Straight answers',
          body: "What this directory is, where the numbers come from, and what it deliberately doesn't do.",
          items: [
            {
              question: 'Does Glasses Near Me charge shops to be listed?',
              answer:
                'No. Listings are compiled from public sources and nobody pays to be on this site. There is no advertising tier, no sponsored placement and no partner programme, so no shop can buy a higher position.',
            },
            {
              question: 'Where do the ratings and review counts come from?',
              answer:
                "They are the public Google ratings and review counts shown for each shop, collected when the listing was compiled. They are snapshots and they change, so check the shop's own page before you go.",
            },
            {
              question: 'Is this a shop, or a booking site?',
              answer:
                "Neither. We don't sell glasses or lenses, we don't take a commission and we don't book appointments for you. We list the shops and, where they publish them, their phone number and website.",
            },
            {
              question: 'Do I need an account to browse?',
              answer:
                "No. There is no sign-up and no email address required to see a shop's rating, phone number or address.",
            },
            {
              question: 'How current is the coverage?',
              answer:
                'Coverage is published country by country: Malaysia, Singapore and Australia today, with 1,992 shops across 587 towns and areas. Shops open and close, so if you spot one that has gone, tell us and we will take it down.',
            },
            {
              question: "I'm a shop owner. How do I fix my listing?",
              answer:
                'Use Claim or correct a listing to have the details updated, or add your shop if we have missed it entirely. There is no charge for either.',
            },
          ],
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          card: true,
          eyebrow: 'For shop owners',
          heading: 'Already listed? Claim it and correct it.',
          body: "Listings are compiled from public sources, so yours is probably already here. Claim it to fix the details, or add it if we've missed you. Neither costs anything.",
          primaryLabel: 'Claim or correct your listing',
          primaryHref: '/for-opticians/claim-or-correct-a-listing',
          secondaryLabel: 'Add your shop',
          secondaryHref: ADD_SHOP_PATH,
        },
      ],
    },
    {
      title: 'About',
      slug: 'about',
      seo: {
        title: 'About Glasses Near Me',
        description:
          'A free directory of optical shops and optometrists, built from public data, where no shop can pay for a better position.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          imageUrl: '/marketing/about.jpg',
          heading: 'About Glasses Near Me',
          body: 'A free directory of optical shops and optometrists, built from public data, where no shop can pay for a better position. This page is the method behind it.',
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'Method',
          heading: 'How a listing gets made',
          body: 'Listings are compiled, not curated. Here is exactly what goes into one, and where each part comes from.',
          columns: '4',
          items: [
            {
              icon: 'public',
              title: 'Pulled from public sources',
              description:
                'Google Places and public web pages. Nothing is taken from behind a login, and nothing is bought from a data broker.',
            },
            {
              icon: 'star',
              title: 'Ratings exactly as published',
              description:
                "The star score and review count shown are the shop's own public figures, copied as they stood when the snapshot was taken.",
            },
            {
              icon: 'call',
              title: 'Contact details where they exist',
              description:
                'A phone number, address or website appears only when the shop publishes one. A blank line means we could not find one, not that it is missing.',
            },
            {
              icon: 'money_off',
              title: 'No paid placement',
              description:
                'No shop can buy a higher position, a better rating or a badge. Correcting a listing is the only influence an owner has.',
            },
          ],
        },
        {
          blockType: 'stats',
          scheme: 'scheme-1',
          centered: true,
          eyebrow: 'Coverage',
          heading: 'How much of the market is actually here',
          body: 'Live totals taken from the directory itself, rather than rounded up for effect.',
          items: [
            { value: '1,992', title: 'Shops listed', description: 'Across Malaysia, Singapore and Australia.' },
            { value: '587', title: 'Towns and areas', description: 'Not one national list — each is a place with its own page.' },
            { value: '1,079', title: 'Shops in Malaysia alone', description: 'The deepest market so far, spread across 42 towns.' },
          ],
        },
        {
          blockType: 'faq',
          scheme: 'scheme-4',
          eyebrow: 'Questions',
          heading: 'What people ask about the directory',
          body: 'How the listings are made, what they are worth, and what they are not.',
          items: [
            {
              question: 'Is Glasses Near Me connected to any of these shops?',
              answer:
                'No. Every shop is listed without its knowledge or permission, including the ones that would rather not be here. Nobody pays, nobody is a partner, and a listing is not an endorsement.',
            },
            {
              question: 'Where does the data come from?',
              answer:
                'Google Places and public web pages. Ratings, review counts, addresses and phone numbers are copied from what each shop already publishes publicly.',
            },
            {
              question: 'Why is a rating here different from what I see on Google?',
              answer:
                'Because both are snapshots, taken at different moments. Ratings move as reviews are added, and our copy ages from the day it was taken.',
            },
            {
              question: 'Can a shop pay to appear higher up?',
              answer: 'No. There is no advertising tier, no sponsored slot and no boosted ranking. Position in a list is not for sale.',
            },
            {
              question: 'How does a shop get corrected or removed?',
              answer:
                'An owner can claim a listing to fix the details, or ask for the listing to be removed entirely. Both routes are free and neither needs an account.',
            },
          ],
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          eyebrow: 'Use it',
          heading: 'Start with your own town',
          body: 'Pick a country, then a town. Every listing carries a rating, a review count and a phone number where the shop publishes one — enough to shortlist two or three before you call.',
          primaryLabel: 'Find a shop near you',
          primaryHref: '/find-a-shop',
        },
      ],
    },
    {
      title: 'For opticians',
      slug: 'for-opticians',
      seo: {
        title: 'For opticians — Glasses Near Me',
        description:
          'Independent optical shops across Malaysia, Singapore and Australia are already in the directory. Nothing to pay.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          imageUrl: '/marketing/opticians.jpg',
          heading: 'Your shop is probably already listed',
          body: 'Independent optical shops across Malaysia, Singapore and Australia are in the directory already, compiled from public sources. You did not have to do anything, and there is nothing to pay. What you can do is make the listing accurate.',
          primaryLabel: 'Claim or correct a listing',
          primaryHref: '/for-opticians/claim-or-correct-a-listing',
          secondaryLabel: 'Add a missing shop',
          secondaryHref: ADD_SHOP_PATH,
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'What is shown',
          heading: 'What every listing carries',
          body: 'The same fields for every shop, whether or not the owner has ever been in touch. Nothing here is an add-on, and nothing is reserved for shops that pay.',
          columns: '4',
          items: [
            {
              icon: 'star',
              title: 'Public rating',
              description:
                "The shop's own star score, always shown beside its review count, so a 4.9 from nine reviews reads differently to a 4.7 from three thousand.",
            },
            {
              icon: 'storefront',
              title: 'Shop name and type',
              description:
                'Optical shop, optometrist, eye care centre, sunglasses store or wholesaler, matched to how the shop describes itself.',
            },
            {
              icon: 'call',
              title: 'Phone number',
              description:
                'Where the shop publishes one. It is the field people use most, because the price question gets answered by calling.',
            },
            {
              icon: 'language',
              title: 'Address and website',
              description:
                "The street address, and the retailer's own site where either is published — a link out to them, never a booking form of ours.",
            },
          ],
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-1',
          eyebrow: 'Owner routes',
          heading: 'Three ways to take control of a listing',
          body: 'All three are free, and none of them need an account. Pick the one that matches your situation.',
          columns: '3',
          items: [
            {
              icon: 'add_business',
              title: 'Add a shop that is missing',
              description:
                'If your shop is not in the directory, add it. It enters the same list as every other shop in that town.',
              linkLabel: 'Add your shop',
              linkHref: ADD_SHOP_PATH,
            },
            {
              icon: 'edit',
              title: 'Claim and correct a listing',
              description:
                'Fix a wrong phone number, a shop that has moved, a stale address or a name that changed. The rating stays as published.',
              linkLabel: 'Claim or correct',
              linkHref: '/for-opticians/claim-or-correct-a-listing',
            },
            {
              icon: 'delete',
              title: 'Ask to be removed',
              description:
                'You can opt out of the directory entirely. The listing comes out, and it stays out unless you add it back yourself.',
              linkLabel: 'Request removal',
              linkHref: '/for-opticians/claim-or-correct-a-listing',
            },
          ],
        },
        {
          blockType: 'faq',
          scheme: 'scheme-4',
          eyebrow: 'Owner questions',
          heading: 'What shop owners usually ask',
          body: 'Straight answers, including the ones that are not in our favour.',
          items: [
            {
              question: 'Do I have to pay to be listed?',
              answer:
                'No. There is no paid tier, no advertising and nothing to upgrade. Being listed costs nothing and buys nothing — that is the whole point of the directory.',
            },
            {
              question: 'Can I pay to rank above another shop?',
              answer:
                'No. Order within a list is not for sale and there is no sponsored slot to buy. The only thing that moves a listing is correcting what it says.',
            },
            {
              question: 'Will you remove a bad review?',
              answer:
                'There is nothing here to remove. The rating and review count are copied from what the shop already publishes publicly — the directory does not collect or host reviews of its own.',
            },
            {
              question: 'What if the listing shows an old address or number?',
              answer:
                'Claim the listing and correct it. The change goes in, and the next refresh keeps it rather than restoring the old details.',
            },
          ],
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          card: true,
          eyebrow: 'Start here',
          heading: 'Get the listing right, then leave it alone',
          body: 'It takes a few minutes: add the shop if it is missing, or claim it if it is already here. After that there is nothing to maintain unless your details change.',
          primaryLabel: 'Claim or correct a listing',
          primaryHref: '/for-opticians/claim-or-correct-a-listing',
          secondaryLabel: 'Add your shop',
          secondaryHref: ADD_SHOP_PATH,
        },
      ],
    },
    {
      title: 'Claim or correct a listing',
      slug: 'for-opticians/claim-or-correct-a-listing',
      seo: {
        title: 'Claim, correct, or remove a listing — Glasses Near Me',
        description: 'If a listing is wrong, out of date or unwanted, this is where to fix it. Free, no account.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          heading: 'Claim, correct, or remove a listing',
          body: 'If a listing here is wrong, out of date or unwanted, this is where to fix it. Free, no account, and no obligation to keep the listing afterwards.',
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'Three routes',
          heading: 'Fixing a listing takes one of three forms',
          body: 'They all start the same way: find the shop, tell us what needs to change, and we act on it against the public record.',
          columns: '3',
          items: [
            {
              icon: 'verified',
              title: 'Claim the listing',
              description:
                'Claiming marks a listing as yours, so corrections from you are applied without being checked against the public record first. Your own details are never published.',
            },
            {
              icon: 'edit',
              title: 'Correct the details',
              description:
                'Name, address, phone number, website or opening hours. Send the correct version and it replaces what the listing is showing.',
            },
            {
              icon: 'delete',
              title: 'Ask for removal',
              description:
                'If you would rather not be in the directory at all, say so and the listing comes out. No reason is needed, and it stays out.',
            },
          ],
        },
        {
          blockType: 'faq',
          scheme: 'scheme-1',
          eyebrow: 'Owner questions',
          heading: 'What claiming actually does',
          body: 'There is no account and no dashboard behind it. What it buys you is accuracy: corrections from you go in without first being checked against the public record.',
          items: [
            {
              question: 'What does claiming a listing get me?',
              answer:
                'It marks the listing as yours so corrections from you are applied directly. Nothing else changes: the rating stays as published and the position in the list stays the same.',
            },
            {
              question: 'Do I need an account?',
              answer: 'No. There is no login anywhere on this directory, which also means there is nothing to remember and nothing to cancel later.',
            },
            {
              question: 'Can I remove a listing and come back later?',
              answer:
                'Yes, but it would be a new listing at that point, carrying whatever the public rating and review count are then. Removal is permanent for the listing that exists today.',
            },
            {
              question: 'Will you take down a bad rating?',
              answer:
                'There is no rating here to take down. We do not collect reviews, so the score shown is the one the shop already publishes on Google.',
            },
          ],
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          eyebrow: 'Not listed yet?',
          heading: 'Add the shop first, then claim it',
          body: 'Claiming only works on a listing that already exists. If yours is missing, add it and get the details right from the start.',
          primaryLabel: 'Add your shop',
          primaryHref: ADD_SHOP_PATH,
        },
      ],
    },
    {
      title: 'Guides',
      slug: 'guides',
      seo: {
        title: 'Eye care guides, in plain English — Glasses Near Me',
        description:
          'What an eye test really costs, why a child’s short-sightedness keeps getting worse, and whether the lens upgrade is worth the money.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          imageUrl: '/marketing/guides.jpg',
          heading: 'Eye care guides, in plain English',
          body: "What an eye test really costs, why a child's short-sightedness keeps getting worse, and whether the lens upgrade on the counter is worth the money. Written to give you the questions to ask, not a sale.",
        },
        {
          blockType: 'searchPrompt',
          scheme: 'scheme-1',
          heading: 'Search the guides',
          body: 'Search by town, topic, or keyword.',
          placeholder: 'Town, topic, or keyword',
          buttonLabel: 'Search guides',
          href: '/guides',
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'Browse by topic',
          heading: "Pick the question you're asking",
          body: 'Four topics, four guides. Each one answers a single question properly, and tells you what to do with the answer.',
          columns: '4',
          items: [
            {
              icon: 'payments',
              title: 'What will an eye test cost me?',
              description: "What a test costs on its own, and the three questions that tell you what you're walking into.",
              linkLabel: 'Read the guide',
              linkHref: '/guides/how-much-does-an-eye-test-cost-in-malaysia',
            },
            {
              icon: 'child_care',
              title: 'Why does my child need stronger glasses every year?',
              description: 'What actually slows short-sightedness in children, what it costs a year, and what to ask before you commit.',
              linkLabel: 'Read the guide',
              linkHref: '/guides/myopia-control-in-children',
            },
            {
              icon: 'receipt_long',
              title: 'What do the numbers on my prescription mean?',
              description: 'SPH, CYL, AXIS and PD — what each number means, and which lens extras actually follow from them.',
              linkLabel: 'Read the guide',
              linkHref: '/guides/how-to-read-your-glasses-prescription',
            },
            {
              icon: 'visibility',
              title: 'Are the lens upgrades worth it?',
              description: 'Blue light filters, anti-reflective coatings, and which upgrades earn their price.',
              linkLabel: 'Read the guide',
              linkHref: '/guides/are-blue-light-glasses-worth-it',
            },
          ],
        },
        {
          blockType: 'contentFeed',
          scheme: 'scheme-4',
          heading: 'Every guide in the library',
          body: 'Every published guide, including the town-by-town eye-test notes. The four cards above are the starting questions.',
          variant: 'text',
          items: guideLibrary.map((guide) => ({
            title: guide.title,
            excerpt: guide.excerpt,
            href: guide.href,
          })),
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          eyebrow: 'Where to go next',
          heading: 'Know what to ask? Find the shop to ask it.',
          body: 'Every country hub lists its shops with the public rating, review count and a phone number where the shop publishes one — enough to call two or three and compare.',
          primaryLabel: 'Find a shop',
          primaryHref: '/find-a-shop',
        },
      ],
    },
    guide({
      slug: 'guides/how-much-does-an-eye-test-cost-in-malaysia',
      title: 'How much does an eye test cost in Malaysia?',
      eyebrow: 'Eye tests',
      paragraphs: [
        'Many shops give a free basic test when you buy glasses. A standalone refraction commonly runs RM30–RM120, and a full eye-health check at a clinic can reach RM400.',
        'Before you book, ask three things: is the test free with a purchase, does it include an eye-health check, and what does it cost on its own?',
      ],
    }),
    guide({
      slug: 'guides/myopia-control-in-children',
      title: 'Myopia control in children: what parents should know',
      eyebrow: "Children's eyes",
      paragraphs: [
        'The options that actually slow myopia progression are worth asking about before you commit to another stronger pair.',
        'Ask what the treatment costs across a year, what evidence the practice is using, and what happens if you stop.',
      ],
    }),
    guide({
      slug: 'guides/how-to-read-your-glasses-prescription',
      title: 'How to read your glasses prescription',
      eyebrow: 'Prescriptions',
      paragraphs: [
        'SPH, CYL, AXIS and PD are the numbers on the slip you were handed. They describe the lens, not a product upgrade.',
        'Read them before you are sold extras, so you can tell which add-ons follow from the prescription and which do not.',
      ],
    }),
    guide({
      slug: 'guides/are-blue-light-glasses-worth-it',
      title: 'Are blue light glasses worth it?',
      eyebrow: 'Lens upgrades',
      paragraphs: [
        'Blue light filters, anti-reflective coatings and other counter upgrades are priced separately from the prescription.',
        'Ask which of them change how you see, which only change how the lens looks, and what each one costs on its own.',
      ],
    }),
    {
      title: 'Find a shop',
      slug: 'find-a-shop',
      seo: {
        title: 'Find a shop — Glasses Near Me',
        description:
          '1,992 independent optical shops and optometrists across Malaysia, Singapore and Australia.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          imageUrl: '/marketing/find.jpg',
          heading: 'Find a shop',
          body: '1,992 independent optical shops and optometrists across Malaysia, Singapore and Australia, compiled from public sources. Pick a country to see its towns and areas.',
        },
        {
          blockType: 'searchPrompt',
          scheme: 'scheme-1',
          heading: 'Search by town, area or shop',
          placeholder: 'Town or shop name',
          buttonLabel: 'Search',
          href: '/find-a-shop',
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-4',
          eyebrow: 'Coverage by country',
          heading: 'Choose a country',
          body: 'Three countries live today. Each one lists its towns and areas with shop counts, public ratings and phone numbers where the shop publishes one.',
          columns: '3',
          variant: 'media',
          items: [
            {
              imageUrl: '/marketing/malaysia.jpg',
              title: 'Malaysia',
              description: '1,079 independent shops across 42 towns.',
              linkLabel: 'Browse 1,079 shops',
              linkHref: '/find-a-shop/malaysia',
            },
            {
              imageUrl: '/marketing/singapore.jpg',
              title: 'Singapore',
              description: '280 independent shops across 108 areas.',
              linkLabel: 'Browse 280 shops',
              linkHref: '/find-a-shop/singapore',
            },
            {
              imageUrl: '/marketing/australia.jpg',
              title: 'Australia',
              description: '633 independent shops across 437 areas.',
              linkLabel: 'Browse 633 shops',
              linkHref: '/find-a-shop/australia',
            },
          ],
        },
        {
          blockType: 'featureGrid',
          scheme: 'scheme-1',
          eyebrow: 'What you get',
          heading: 'What every listing carries',
          body: "Every listing holds the same set of fields, taken from the shop's public record rather than written by us or by the shop.",
          columns: '3',
          items: [
            { icon: 'storefront', title: 'Name and type', description: "The shop's own name, and whether it's an optical shop, an optometrist, an eye care centre or a sunglasses store." },
            { icon: 'star', title: 'Public rating', description: 'The Google star rating, shown exactly as the public record has it.' },
            { icon: 'reviews', title: 'Review count', description: "How many people left that rating. A 4.9 from twelve reviews isn't the same as a 4.9 from two thousand." },
            { icon: 'location_on', title: 'Address', description: 'The street address, where the shop publishes one.' },
            { icon: 'call', title: 'Phone number', description: 'The number to ring, where the shop publishes one. Most listings have one.' },
            { icon: 'language', title: 'Website', description: "A link to the shop's own site, where it publishes one. No booking middleman in between." },
          ],
        },
        {
          blockType: 'faq',
          scheme: 'scheme-4',
          eyebrow: 'Questions',
          heading: 'Before you trust a listing',
          body: 'Where the data comes from, how current it is, and what you should check yourself before you go.',
          items: [
            {
              question: 'How do I know the ratings are real?',
              answer:
                "They're the public Google star ratings and review counts shown for each shop, collected when the listing was compiled. We don't write them, filter them or round them up.",
            },
            {
              question: 'Are the ratings up to date?',
              answer:
                "They're snapshots. Ratings and review counts change, and a shop can gain or lose reviews after we last checked.",
            },
            {
              question: "Why is a shop's phone number missing?",
              answer:
                "Because the shop doesn't publish one publicly. We only show details that are already on the public record.",
            },
            {
              question: 'Can a shop pay to appear higher up?',
              answer: 'No. There is no advertising tier and no sponsored slot.',
            },
          ],
        },
        {
          blockType: 'cta',
          scheme: 'scheme-5',
          card: true,
          eyebrow: 'For shop owners',
          heading: 'Own one of these shops?',
          body: "Listings are compiled from public sources, so yours is probably already here. Claim it to fix the details, or add it if we've missed you. Neither costs anything.",
          primaryLabel: 'Claim or correct your listing',
          primaryHref: '/for-opticians/claim-or-correct-a-listing',
          secondaryLabel: 'Add your shop',
          secondaryHref: ADD_SHOP_PATH,
        },
      ],
    },
    country('malaysia', 'Malaysia', '1,079 independent shops across 42 towns — from Kuala Lumpur and Petaling Jaya to Miri and Kota Bharu.', '/marketing/malaysia.jpg'),
    country(
      'singapore',
      'Singapore',
      '280 independent shops across 108 areas — about three shops per area, so the choice is usually local.',
      '/marketing/singapore.jpg',
    ),
    country(
      'australia',
      'Australia',
      '633 independent shops across 437 areas — wide and thin, with only one or two shops in most areas.',
      '/marketing/australia.jpg',
    ),
    {
      title: 'Add a listing',
      slug: ADD_SHOP_SLUG,
      seo: {
        title: 'Add a listing — Glasses Near Me',
        description: 'Add an optical shop that the directory has missed. Free, and it enters the same list as every other shop.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-2',
          heading: 'Add a listing',
          body: 'If your shop is missing, add it. It enters the same list as every other shop in that town. There is no charge and no account.',
          primaryLabel: 'Claim an existing listing',
          primaryHref: '/for-opticians/claim-or-correct-a-listing',
        },
        {
          blockType: 'richContent',
          scheme: 'scheme-1',
          heading: 'What adding a shop does',
          content: richText([
            'Adding a shop puts it in the same list as every other shop in that town. There is no charge, no account, and no way to buy a higher position.',
            'A listing carries the same public fields as every other shop: name, type, rating, review count, address, phone and website, copied from what the shop already publishes.',
            'Listing data is compiled from public sources and may change. Glasses Near Me is an independent directory — not affiliated with the shops listed, and not a marketplace.',
          ]),
        },
      ],
    },
    {
      title: 'Privacy policy',
      slug: 'privacy-policy',
      seo: {
        title: 'Privacy policy — Glasses Near Me',
        description: 'What this site collects when you browse, and what happens if you submit a listing or a correction.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-1',
          frame: 'card',
          align: 'center',
          heading: 'Privacy policy',
          body: 'What this site collects when you browse, what happens if you submit a listing or a correction, and what it does not do.',
        },
        {
          blockType: 'richContent',
          scheme: 'scheme-4',
          narrow: true,
          content: richText([
            { heading: 'What this policy covers' },
            'Glasses Near Me is a free-to-browse directory of optical shops. There is no account, no login and no subscription.',
            { heading: 'Browsing the directory' },
            'You can read every page, listing and guide without giving us anything. Nothing is gated behind a form, and we never ask for an email address to show you a shop.',
            'Like most sites, the hosting and analytics tools record basic technical information: the page requested, the page you came from, a rough location derived from your IP address, and your device type.',
            { heading: 'When you submit a listing or a correction' },
            "If you add a shop, or ask for a listing to be corrected or removed, we need enough information to act on it: the shop's details, and a way to reach you if something needs checking.",
            'Corrections are checked against what the shop publishes publicly. Your name and contact details are not published on the listing.',
            { heading: 'Where the listing data comes from' },
            'Shop names, addresses, phone numbers, websites, star ratings and review counts are compiled from public sources, including Google Places and public web pages.',
            { heading: 'Cookies' },
            'Where cookies are used at all, they are for basic site function and anonymous traffic measurement. There is nothing here you need to accept in order to keep browsing.',
          ]),
        },
      ],
    },
    {
      title: 'Terms of use',
      slug: 'terms-of-use',
      seo: {
        title: 'Terms of use — Glasses Near Me',
        description:
          'Listings are compiled from public sources, they are a snapshot that changes, and being listed here is not an endorsement.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-1',
          frame: 'card',
          align: 'center',
          heading: 'Terms of use',
          body: 'The short version: listings are compiled from public sources, they are a snapshot that changes, and being listed here is not an endorsement by us.',
        },
        {
          blockType: 'richContent',
          scheme: 'scheme-4',
          narrow: true,
          content: richText([
            { heading: 'What this site is' },
            'Glasses Near Me is an independent, free-to-browse directory of optical shops and optometrists. It is not a marketplace, it does not sell eyewear, and it is not affiliated with any of the shops listed in it.',
            { heading: 'Where the data comes from' },
            'Listings are compiled from public sources, principally Google Places and public web pages. Ratings, review counts, addresses, phone numbers and websites are copied from what each shop already publishes publicly.',
            'Those figures are a snapshot taken at a point in time. Ratings move, shops close, phone numbers change, and this site will sometimes be out of date.',
            { heading: 'Ranking and paid placement' },
            'No shop can pay for a higher position or a better presentation. There is no advertising tier, no sponsored listing and no way to buy a rating.',
            { heading: 'Owner requests' },
            'A shop owner can add a listing, claim an existing one to correct it, or ask for it to be removed. Removal requests are actioned, and no reason is required.',
            { heading: 'Using the site' },
            'You are welcome to read, browse and share what is here. Scraping the directory wholesale, or republishing it as your own, is not permitted.',
          ]),
        },
      ],
    },
    {
      title: 'Logo and two-column blocks',
      slug: 'blocks',
      seo: {
        title: 'Block library — Glasses Near Me',
        description: 'Optional logo strip and two-column sections editors can place on any page.',
      },
      layout: [
        {
          blockType: 'hero',
          scheme: 'scheme-3',
          eyebrow: 'Block library',
          heading: 'Optional sections, same tokens',
          body: 'Logo strip and two-column are available in the Pages layout field even though the live marketing pages do not lead with them. This page is here so both renderers can be reviewed.',
        },
        {
          blockType: 'logoStrip',
          scheme: 'scheme-1',
          eyebrow: 'Coverage',
          heading: 'Three countries',
          logos: [{ name: 'Malaysia' }, { name: 'Singapore' }, { name: 'Australia' }],
        },
        {
          blockType: 'twoColumn',
          scheme: 'scheme-4',
          eyebrow: 'Two column',
          heading: 'A place for a photograph',
          body: 'Upload an image on this block in the admin and choose which side it sits on. Until then the column holds a forest-tinted placeholder.',
          imagePosition: 'right',
          primaryLabel: 'Back to the homepage',
          primaryHref: '/',
        },
      ],
    },
  ]

function guide(input: { slug: string; title: string; eyebrow: string; paragraphs: string[] }) {
  return {
    title: input.title,
    slug: input.slug,
    seo: {
      title: `${input.title} — Glasses Near Me`,
      description: input.paragraphs[0],
    },
    layout: [
      {
        blockType: 'hero',
        scheme: 'scheme-2',
        eyebrow: input.eyebrow,
        heading: input.title,
        body: input.paragraphs[0],
      },
      {
        blockType: 'richContent',
        scheme: 'scheme-1',
        content: richText(input.paragraphs),
      },
      {
        blockType: 'cta',
        scheme: 'scheme-5',
        eyebrow: 'Where to go next',
        heading: 'Know what to ask? Find the shop to ask it.',
        body: 'Country hubs list shops with the public rating, review count and a phone number where the shop publishes one.',
        primaryLabel: 'Find a shop',
        primaryHref: '/find-a-shop',
        secondaryLabel: 'All guides',
        secondaryHref: '/guides',
      },
    ],
  }
}

function country(slug: string, name: string, description: string, imageUrl: string) {
  return {
    title: name,
    slug: `find-a-shop/${slug}`,
    seo: {
      title: `${name} optical shops — Glasses Near Me`,
      description,
    },
    layout: [
      {
        blockType: 'hero',
        scheme: 'scheme-2',
        imageUrl,
        eyebrow: 'Find a shop',
        heading: name,
        body: description,
      },
      {
        blockType: 'richContent',
        scheme: 'scheme-1',
        heading: `Towns in ${name}`,
        content: richText([
          description,
          `Town pages for ${name} list each shop with its public rating, review count and phone number where the shop publishes one.`,
        ]),
      },
      {
        blockType: 'cta',
        scheme: 'scheme-5',
        heading: 'Compare before you call',
        body: 'Ratings, review counts and phone numbers sit on every listing. Shortlist two or three rather than taking the first result.',
        primaryLabel: 'All countries',
        primaryHref: '/find-a-shop',
        secondaryLabel: 'Read the guides',
        secondaryHref: '/guides',
      },
    ],
  }
}

const seededSlugs = new Set(pages.map((page) => page.slug))

const libraryPages = guideLibrary
  .filter((card) => !seededSlugs.has(card.href.replace(/^\//, '')))
  .map((card) =>
    guide({
      slug: card.href.replace(/^\//, ''),
      title: card.title,
      eyebrow: 'Guides',
      paragraphs: [card.excerpt],
    }),
  )

const HREF_KEYS = new Set(['primaryHref', 'secondaryHref', 'linkHref', 'href'])

function rewriteAddHrefs(value: unknown): { value: unknown; changed: boolean } {
  if (Array.isArray(value)) {
    let changed = false
    const next = value.map((item) => {
      const result = rewriteAddHrefs(item)
      if (result.changed) changed = true
      return result.value
    })
    return { value: changed ? next : value, changed }
  }

  if (value && typeof value === 'object') {
    let changed = false
    const next: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (HREF_KEYS.has(key) && child === '/add') {
        next[key] = ADD_SHOP_PATH
        changed = true
        continue
      }
      const result = rewriteAddHrefs(child)
      next[key] = result.value
      if (result.changed) changed = true
    }
    return { value: changed ? next : value, changed }
  }

  return { value, changed: false }
}

async function migrateLegacyAddPage(payload: Payload) {
  const legacy = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: { slug: { equals: 'add' } },
  })
  const existing = legacy.docs[0]
  if (!existing) return

  const modern = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    where: { slug: { equals: ADD_SHOP_SLUG } },
  })
  if (modern.docs[0]) return

  await payload.update({
    collection: 'pages',
    id: existing.id,
    data: { slug: ADD_SHOP_SLUG },
  })
}

async function rewriteStoredAddHrefs(payload: Payload) {
  const found = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 500,
    pagination: false,
  })

  for (const page of found.docs) {
    const result = rewriteAddHrefs(page.layout)
    if (!result.changed) continue
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout: result.value } as never,
    })
  }
}

export async function seedDemoPages(payload: Payload) {
  await migrateLegacyAddPage(payload)

  for (const page of [...pages, ...libraryPages]) {
    const existing = await payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      where: { slug: { equals: page.slug } },
    })
    if (existing.docs.length > 0) continue

    await payload.create({
      collection: 'pages',
      data: page as never,
    })
  }

  await rewriteStoredAddHrefs(payload)
}
