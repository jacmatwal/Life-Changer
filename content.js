/*
 * All of the app's wording lives here, so it can be edited without touching the logic.
 *
 * The ideas come from Dan Koe's essay "How to fix your entire life in 1 day".
 * The wording is a simplified paraphrase, not a copy of the essay.
 */
window.LC_CONTENT = {
  source: {
    title: 'How to fix your entire life in 1 day',
    author: 'Dan Koe',
    url: 'https://letters.thedankoe.com/p/how-to-fix-your-entire-life-in-1'
  },

  start: {
    eyebrow: 'A one-day protocol',
    title: 'Become the person first. The habits come after.',
    plan: [
      { route: 'morning', name: 'Morning', kind: 'Excavation', text: '15 to 30 minutes. Eleven questions about the life you don’t want and the one you do.' },
      { route: 'day', name: 'Daytime', kind: 'Pattern interrupts', text: 'Six timed check-ins that catch you on autopilot.' },
      { route: 'evening', name: 'Evening', kind: 'Synthesis', text: 'Name the real enemy, then set a one-year goal, a one-month project and daily actions.' },
      { route: 'game', name: 'Game board', kind: 'Your plan on one page', text: 'Six pieces: stakes, win condition, mission, boss fight, daily quests and rules.' }
    ],
    notes: [
      { title: 'Give it a full day', text: 'The protocol is one whole day of focused attention. Skimming it in ten minutes does nothing.' },
      { title: 'Writing is the work', text: 'Questioning yourself is thinking, and most people skip it. Type real answers, in full sentences.' },
      { title: 'Tension comes first', text: 'Change tends to arrive quickly after discomfort builds: dissonance, then uncertainty, then discovery. Expect the morning to be uncomfortable.' },
      { title: 'Clarity sets the speed', text: 'You can’t compress years of progress into months while you are vague about what you want.' },
      { title: 'Timing matters', text: 'This works when you are in the right chapter of your life, usually when you are fed up with the old one. If today isn’t that day, come back.' },
      { title: 'Goals decide what you see', text: 'What you aim at determines what you notice and what you value. That is why the evening ends in goals.' }
    ]
  },

  ideas: {
    eyebrow: 'The idea · 5 minute read',
    title: 'Why forcing new habits fails',
    intro: 'The whole essay rests on one claim: behaviour follows identity. Here is the argument, cut down to what you need before you start.',
    problem: [
      { lead: 'Actions are the wrong target.', text: 'Most people try to change by forcing new actions onto the same old self. It rarely lasts.' },
      { lead: 'Results come from who you are.', text: 'Lasting change means becoming the kind of person who does those things without a fight.' },
      { lead: 'Your current behaviour is working.', text: 'It serves a goal you may never have chosen, and that goal is what keeps you where you are.' }
    ],
    loop: {
      title: 'How an identity gets built',
      intro: 'Koe describes identity as a loop that runs until it feels like “just who I am”. Step through it.',
      steps: [
        { title: 'Take on a goal', text: 'You pick up a goal, chosen or absorbed. Often it arrives in childhood, long before you could question it: be liked, stay safe, don’t stand out.' },
        { title: 'See through it', text: 'The goal becomes a lens. You start reading every situation by whether it helps or threatens that goal.' },
        { title: 'Notice what fits', text: 'Out of everything going on around you, you register only what the lens marks as relevant. The rest never reaches you.' },
        { title: 'Act, get feedback', text: 'You act on what you noticed and the world answers. Whatever serves the goal gets reinforced.' },
        { title: 'Repeat', text: 'Do it enough times and it stops being a decision. It runs on its own.' },
        { title: 'It becomes you', text: 'The automatic pattern gets a name: “I’m just this kind of person.”' },
        { title: 'Defend it', text: 'Anything that questions the identity now feels like an attack, and you fight it off the way your body fights a physical threat.' },
        { title: 'Choose again', text: 'The identity you are defending picks your next goals, and the loop runs again.' }
      ],
      note: 'The one-day protocol goes after step 1. Change the goal and the lens, the noticing and the actions change with it.'
    },
    principles: [
      {
        title: 'Identity first, actions second',
        text: 'People who get lasting results aren’t grinding. Their way of living feels normal to them. So take on the lifestyle that produces the result before the result shows up. When the change is real, habits that don’t fit your goals start to feel off-putting.'
      },
      {
        title: 'Every behaviour has a goal',
        text: 'Behaviour is goal-directed, even when the goal is hidden from you. Procrastination, for example, may be protecting you from being judged on finished work. Some of the goals you pursue without knowing it are hurting you. To change the behaviour, change the goal and the point of view behind it.'
      },
      {
        title: 'Identity defends itself',
        text: 'Once food and shelter are covered, people fight for their ideas about themselves instead. That is why real change feels threatening, and why a good argument is rarely enough to change someone.'
      },
      {
        title: 'Minds grow in stages',
        text: 'Development moves through predictable stages. Koe places most readers between stage 4 and stage 8. The later stages involve questioning the beliefs you inherited and building principles of your own.',
        stages: ['Impulsive', 'Self-Protective', 'Conformist', 'Self-Aware', 'Conscientious', 'Individualist', 'Strategist', 'Construct-Aware', 'Unitive'],
        stageRange: [4, 8],
        stageNote: 'Stage names follow the ego-development model the essay draws on.'
      },
      {
        title: 'Intelligence is steering',
        text: 'Koe defines intelligence as the ability to get what you want out of life. It takes agency, opportunity, and a steering loop borrowed from cybernetics. High intelligence, in this sense, is the ability to iterate, persist and learn from mistakes.',
        chain: ['Set a goal', 'Act', 'Sense where you are', 'Compare to the goal', 'Adjust']
      }
    ]
  },

  morning: {
    eyebrow: 'Morning · Excavation · 15–30 min',
    title: 'Dig up what you’ve been avoiding',
    groups: [
      {
        name: 'Anti-vision',
        intro: 'Start with the life you don’t want. It is easier to see than the one you do, and it gives you something to move away from.',
        questions: [
          { id: 'a1', prompt: 'What dull, ongoing dissatisfaction have you learned to live with?', hint: 'Not the sharp pain. The low hum you have stopped noticing.' },
          { id: 'a2', prompt: 'What do you keep complaining about but never change?', hint: 'List up to three. A complaint you repeat for years points at something you are choosing.' },
          { id: 'a3', prompt: 'What truth about your life right now would be hardest to admit out loud?', hint: 'Picture saying it to someone you respect.' },
          { id: 'a4', prompt: 'Nothing changes for five years. Describe an ordinary Tuesday.', hint: 'Where do you wake up? How does your body feel? What do you do, hour by hour?' },
          { id: 'a5', prompt: 'Now make it ten years. Which doors have closed?', hint: 'What did you miss? Who gave up on you? What do people say about you when you are not in the room?' },
          { id: 'a6', prompt: 'You are at the end of your life and you played it safe. What did you never try?', hint: 'Name what it cost you.' },
          { id: 'a7', prompt: 'Which identity would you have to give up in order to change?', hint: '“I am the kind of person who…” What would it cost you socially to stop being that person?' },
          { id: 'a8', prompt: 'What is the embarrassing real reason you haven’t changed yet?', hint: 'The one that sounds scared or lazy, not the one that sounds reasonable.' }
        ]
      },
      {
        name: 'Vision',
        intro: 'Now turn around. Same honesty, opposite direction.',
        questions: [
          { id: 'v1', prompt: 'Three years from now, with nothing holding you back: describe an ordinary Tuesday in the life you want.', hint: 'Use the same detail as before. Where, with whom, doing what, feeling how.' },
          { id: 'v2', prompt: 'What would you have to believe about yourself for that life to feel natural?', hint: 'Finish the sentence: “I am the kind of person who…”' },
          { id: 'v3', prompt: 'If you were already that person, what would you do this week?', hint: 'One concrete thing is enough.' }
        ]
      }
    ],
    done: { label: 'Finish the morning', route: 'day' }
  },

  day: {
    eyebrow: 'Daytime · Pattern interrupts',
    title: 'Catch yourself on autopilot',
    intro: 'Six questions at set times. Each one interrupts whatever you are doing and makes you look at it. Answer in a line or two, right when it fires.',
    remind: 'This page can’t ring your phone. Set six alarms, or add the questions to your calendar, then come back here to answer.',
    // "at" is minutes after midnight.
    checkins: [
      { id: 't1', at: 11 * 60, prompt: 'What am I avoiding right now by doing what I’m doing?' },
      { id: 't2', at: 13 * 60 + 30, prompt: 'If someone watched my last two hours, what would they conclude I want from life?' },
      { id: 't3', at: 15 * 60 + 15, prompt: 'Am I moving toward the life I dread or the life I want?' },
      { id: 't4', at: 17 * 60, prompt: 'What is the most important thing I’m pretending doesn’t matter?' },
      { id: 't5', at: 19 * 60 + 30, prompt: 'What did I do today to protect my identity, and not because I wanted to?' },
      { id: 't6', at: 21 * 60, prompt: 'When did I feel most alive today? When did I feel most dead?' }
    ],
    extraTitle: 'For the gaps',
    extraIntro: 'Carry these on a walk, a commute or in a queue. They don’t run on a schedule.',
    extras: [
      { id: 'c1', prompt: 'What would change if I stopped needing people to see me as the person I’ve been playing?', hint: 'Name the role: the reliable one, the smart one, the easygoing one.' },
      { id: 'c2', prompt: 'Where in my life am I trading aliveness for safety?' },
      { id: 'c3', prompt: 'What is the smallest version of the person I want to become that I could be tomorrow?' }
    ]
  },

  evening: {
    eyebrow: 'Evening · Synthesis',
    title: 'Turn the day into a direction',
    groups: [
      {
        name: 'Integration',
        intro: 'Pull the day together. Reread your morning answers and check-ins first if you can.',
        questions: [
          { id: 'e1', prompt: 'After today, what feels most true about why you have been stuck?' },
          { id: 'e2', prompt: 'What is the real enemy?', hint: 'Name the inner pattern or belief that has been running things. Not a circumstance, and not another person.' },
          { id: 'antiVision', prompt: 'In one sentence: what do you refuse to let your life become?', hint: 'This is your anti-vision. It should sting a little when you read it back.' },
          { id: 'vision', prompt: 'In one sentence: what are you building toward?', hint: 'This is your vision. A first draft is fine, because it will change as you do.' }
        ]
      },
      {
        name: 'Goals as lenses',
        intro: 'Treat these goals as lenses that direct your attention, not finish lines to cross.',
        questions: [
          { id: 'year', prompt: 'One year from now, what would have to be true for you to know you have broken the pattern?', hint: 'One concrete thing you could point at.' },
          { id: 'month', prompt: 'One month from now, what would have to be true for that one-year goal to still be possible?', hint: 'A project: a skill to learn or a thing to build.' },
          { id: 'daily', prompt: 'What two or three things would the person you are becoming simply do tomorrow?', hint: 'One per line. These become your daily quests on the game board.', placeholder: 'One action per line' }
        ]
      },
      {
        name: 'Rules',
        intro: 'Last piece. A game needs limits.',
        questions: [
          { id: 'constraints', prompt: 'What are you not willing to sacrifice to get there?', hint: 'Health, a relationship, your integrity, your sleep. Limits rule out the lazy routes and force creative ones.' }
        ]
      }
    ],
    done: { label: 'See your game board', route: 'game' }
  },

  game: {
    eyebrow: 'Game board',
    title: 'Your life, set up as a game',
    intro: 'Games hold attention because they have a win condition, stakes, a mission and rules. These six pieces give your life the same structure. Edit any of them here.',
    tiles: [
      { key: 'antiVision', name: 'Anti-vision', mechanic: 'What’s at stake', prompt: 'The life you never want to live.' },
      { key: 'vision', name: 'Vision', mechanic: 'How you win', prompt: 'The life you are working toward.' },
      { key: 'year', name: 'One-year goal', mechanic: 'The mission', prompt: 'What your life looks like a year from now.' },
      { key: 'month', name: 'One-month project', mechanic: 'The boss fight', prompt: 'The skill to learn or the thing to build. This is where you earn experience.' },
      { key: 'daily', name: 'Daily levers', mechanic: 'Daily quests', prompt: 'The two or three priority tasks that move things forward. One per line.' },
      { key: 'constraints', name: 'Constraints', mechanic: 'The rules', prompt: 'What you will not sacrifice along the way.' }
    ]
  }
};
