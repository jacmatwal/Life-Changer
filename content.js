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
      { route: 'morning', name: 'Morning', kind: 'Excavation', text: '15 to 30 minutes. Fourteen questions about the pain you tolerate, the life you don’t want and the one you do.' },
      { route: 'day', name: 'Daytime', kind: 'Pattern interrupts', text: 'Six timed questions that pull you out of autopilot. Set the reminders before you start.' },
      { route: 'evening', name: 'Evening', kind: 'Synthesis', text: 'Name the real enemy, then set a one-year lens, a one-month lens and tomorrow’s actions.' },
      { route: 'game', name: 'Game board', kind: 'Your plan on one page', text: 'Six pieces: stakes, win condition, mission, boss fight, daily quests and rules.' }
    ],
    notes: [
      { title: 'Give it a full day', text: 'A morning sitting, six interruptions and an evening sitting. Koe suggests running it once a year to reset.' },
      { title: 'Do your own thinking', text: 'Koe is explicit: don’t hand these questions to AI. Questioning is thinking, and the point is to push past your own limits.' },
      { title: 'Pen and paper work too', text: 'The essay asks for pen and paper. Typing here is fine if you write real sentences. If a keyboard makes you skim, write by hand and use this for the questions and the check-ins.' },
      { title: 'Tension comes first', text: 'People who change fast go through three phases: dissonance, uncertainty, then discovery. Expect the morning to be uncomfortable.' },
      { title: 'Timing matters', text: 'Koe doesn’t promise this works for everyone. It lands when you are in the right chapter of your life, usually when you are fed up with the old one.' },
      { title: 'Goals decide what you see', text: 'A goal works as a lens: it decides what you notice and what counts as success. That is why the evening ends in goals.' }
    ]
  },

  ideas: {
    eyebrow: 'The idea · 5 minute read',
    title: 'Why forcing new habits fails',
    intro: 'The essay makes five arguments before it reaches the protocol. Here they are, cut down to what you need before you start.',
    sections: [
      {
        title: 'You aren’t there because you aren’t yet the person who would be',
        blocks: [
          { p: 'A big goal asks two things of you: change what you do, and change who you are so the doing comes naturally. Most people work only on the first. They stay disciplined for a couple of weeks, then slide back.' },
          { p: 'Koe’s test is the bodybuilder, who doesn’t grind to eat well. Eating badly is what would take effort. The lifestyle that produces a result has to be in place long before the result arrives, and it has to stay afterwards.' },
          { p: 'When the change is real, habits that work against the goal start to feel disgusting, because you can see what they add up to.' }
        ]
      },
      {
        title: 'You aren’t there because part of you wants something else',
        blocks: [
          { p: 'All behaviour aims at a goal, and most of those goals are unconscious. Some of them hurt you, and you cover them with an explanation that sounds acceptable.' },
          {
            table: {
              head: ['The story you tell', 'The goal underneath'],
              rows: [
                ['“I keep procrastinating because I lack discipline.”', 'Avoiding the judgment that comes with finishing your work and showing it.'],
                ['“I stay in this job because I’m not a risk taker.”', 'Safety, predictability, and not looking like a failure to people who think the job is a success.']
              ]
            }
          },
          { p: 'So real change means changing the goal. Koe defines a goal as a point of view: a projection into the future that works like a lens and decides which information, ideas and resources you notice.' }
        ]
      },
      {
        title: 'You aren’t there because you’re afraid to be',
        blocks: [
          { p: 'Koe describes identity as a loop that runs until it feels like “just who I am”. Step through it.' },
          { loop: true },
          { callout: 'Koe says the cycle has to be broken between steps 6 and 7 (the cut on the ring): after a pattern has become “who I am”, and before you rush to defend it.' },
          { p: 'The loop starts in childhood. You depended on your parents to survive, so you took on their beliefs, which they took on from their own parents. Once physical survival is handled, you defend your ideas about yourself instead. A threat to your identity sets off the same fight-or-flight response as a threat to your body.' }
        ]
      },
      {
        title: 'The life you want sits at a certain level of mind',
        blocks: [
          { p: 'Minds develop through predictable stages. As a child you soak up whatever beliefs keep you safe, and if you never question them they harden. Koe uses nine stages of ego development and guesses most readers sit between 4 and 8: nearer 4 if you are looking for a change, nearer 8 if you are reading out of curiosity.' },
          { stages: true },
          { p: 'Which stage you are in matters less than it sounds, because moving up from any of them follows the same pattern.' }
        ]
      },
      {
        title: 'Intelligence is getting what you want out of life',
        blocks: [
          { p: 'Koe’s formula for success has three ingredients: agency, opportunity and intelligence. He borrows Naval Ravikant’s definition of intelligence, getting what you want out of life, and explains it with cybernetics, the study of how systems steer.' },
          { chain: ['Have a goal', 'Act toward it', 'Sense where you are', 'Compare to the goal', 'Act again'] },
          { p: 'By this measure, intelligence is the ability to iterate, persist and keep the big picture in view. Low intelligence is failing to learn from mistakes: hitting an obstacle and quitting. Given a long enough timescale, any problem can be solved.' },
          { p: 'Most people run on goals that were assigned to them: school, job, retire at 65. Koe’s sequence for getting out:' },
          { list: ['Reject the known path', 'Go into the unknown', 'Set new, higher goals', 'Accept the chaos that comes with growth', 'Study the general principles of nature', 'Become a deep generalist'] }
        ]
      }
    ],
    loop: {
      breakAfter: 6,
      steps: [
        { title: 'Want a goal', text: 'You want to achieve something. As a child the goal is survival, and it means conforming to the people who raise you.' },
        { title: 'See through it', text: 'The goal becomes a lens. You read reality by whether it helps or threatens that goal.' },
        { title: 'Notice what fits', text: 'You register only the information and ideas the lens marks as important. This is learning.' },
        { title: 'Act, get feedback', text: 'You act toward the goal and get feedback that you are making progress.' },
        { title: 'Repeat', text: 'You repeat the behaviour until it is automatic and unconscious. This is conditioning.' },
        { title: 'It becomes you', text: 'The behaviour becomes part of who you think you are: “I am the type of person who…”' },
        { title: 'Defend it', text: 'You defend that identity to stay psychologically consistent. A challenge to it feels like an attack.' },
        { title: 'Choose again', text: 'The identity shapes your next goals and the cycle restarts. If the identity works against a good life, things get bad quickly.' }
      ]
    },
    stages: {
      range: [4, 8],
      note: 'Outlined: stages 4 to 8. Tap a stage to read it. The model is Cook-Greuter’s stages of ego development, one of several the essay cites.',
      items: [
        { name: 'Impulsive', text: 'Feeling and action are the same thing, and thinking is black and white. A toddler who hits when angry.' },
        { name: 'Self-Protective', text: 'The world looks dangerous, so you look out for yourself. A kid who hides the report card and works out what adults want to hear.' },
        { name: 'Conformist', text: 'You are your group, and its rules feel like reality. You can’t imagine why anyone would vote differently from your family.' },
        { name: 'Self-Aware', text: 'You notice an inner life that doesn’t match the outside. Sitting in church unsure you believe what everyone else seems to, with no idea yet what to do about it.' },
        { name: 'Conscientious', text: 'You build your own principles and hold yourself to them. A career plan with clear milestones, because the right effort should bring the right results.' },
        { name: 'Individualist', text: 'You see that your principles were shaped by where you came from, and you hold them more loosely. Noticing your ambition was really about a parent’s approval.' },
        { name: 'Strategist', text: 'You work with systems while staying aware of your own part in them. Leading a team while questioning your blind spots.' },
        { name: 'Construct-Aware', text: 'You see every framework, your identity included, as a useful fiction. Watching yourself play “founder” with gentle amusement.' },
        { name: 'Unitive', text: 'The line between self and life dissolves. Work, rest and play feel like the same thing.' }
      ]
    }
  },

  morning: {
    eyebrow: 'Morning · Excavation · 15–30 min',
    title: 'Dig up what you’ve been avoiding',
    groups: [
      {
        name: 'Pain',
        intro: 'The first four questions are about what hurts in your life as it is. If you can’t answer one straight away, skip it and come back.',
        questions: [
          { id: 'a1', prompt: 'What dull, persistent dissatisfaction have you learned to live with?', hint: 'Not the deep suffering. The thing you tolerate. What you don’t hate, you put up with.' },
          { id: 'a2', prompt: 'What do you complain about again and again but never change?', hint: 'Write down the three complaints you have voiced most in the past year.' },
          { id: 'a2b', prompt: 'For each complaint: going by your behaviour and not your words, what would an observer conclude you actually want?', recall: { key: 'a2', label: 'Your complaints' } },
          { id: 'a3', prompt: 'What truth about your life right now would be unbearable to admit to someone you deeply respect?' }
        ]
      },
      {
        name: 'Anti-vision',
        intro: 'Now turn that pain into an anti-vision: a brutally clear picture of the life you don’t want. It gives you something to push away from.',
        questions: [
          { id: 'a4', prompt: 'Nothing changes for five years. Describe an average Tuesday.', hint: 'Where do you wake up, and how does your body feel? What is your first thought? Who is around you? What fills 9 to 6? How do you feel at 10pm?' },
          { id: 'a5', prompt: 'Now make it ten years. Which doors have closed?', hint: 'What have you missed? Who gave up on you? What do people say about you when you are not in the room?' },
          { id: 'a6', prompt: 'You are at the end of your life. You lived the safe version and never broke the pattern. What did it cost?', hint: 'What did you never let yourself feel, try or become?' },
          { id: 'a6b', prompt: 'Who do you know who is already living that future?', hint: 'Someone five, ten or twenty years further down the same road. What do you feel when you picture becoming them?' },
          { id: 'a7', prompt: 'Which identity would you have to give up in order to change?', hint: 'Write it as “I am the type of person who…” What would it cost you socially to stop being that person?' },
          { id: 'a8', prompt: 'What is the most embarrassing reason you haven’t changed?', hint: 'The one that makes you sound weak, scared or lazy, not the one that sounds reasonable.' },
          { id: 'a8b', prompt: 'If your current behaviour is a form of self-protection, what exactly is it protecting?', hint: 'And what is that protection costing you?' }
        ]
      },
      {
        name: 'Vision',
        intro: 'That unease is energy, so point it somewhere. This is a minimum viable vision. Like the first version of a product, it starts out rough and sharpens with use.',
        questions: [
          { id: 'v1', prompt: 'Forget what is realistic. If you could snap your fingers and be living a different life in three years, what would an average Tuesday look like?', hint: 'What you actually want, in the same detail as your five-year Tuesday.' },
          { id: 'v2', prompt: 'What would you have to believe about yourself for that life to feel natural, not forced?', hint: 'Write the identity statement: “I am the type of person who…”' },
          { id: 'v3', prompt: 'What is one thing you would do this week if you were already that person?' }
        ]
      }
    ],
    done: { label: 'Finish the morning', route: 'day' }
  },

  day: {
    eyebrow: 'Daytime · Pattern interrupts',
    title: 'Catch yourself on autopilot',
    intro: 'Journaling alone won’t change you. The day’s job is to break the unconscious patterns that keep you the same, so six questions interrupt you at set times. In between, keep turning over what you wrote this morning.',
    remind: 'This page can’t ring your phone. Before the morning sitting, put each question into a phone reminder or calendar event so you can start thinking the moment it fires. The times are Koe’s suggestions. Change any that clash with your day: odd times that don’t collide with your schedule work best.',
    // "at" is minutes after midnight. People can change each time in the app.
    checkins: [
      { id: 't1', at: 11 * 60, prompt: 'What am I avoiding right now by doing what I’m doing?' },
      { id: 't2', at: 13 * 60 + 30, prompt: 'If someone had filmed my last two hours, what would they conclude I want from my life?' },
      { id: 't3', at: 15 * 60 + 15, prompt: 'Am I moving toward the life I hate or the life I want?' },
      { id: 't4', at: 17 * 60, prompt: 'What is the most important thing I’m pretending isn’t important?' },
      { id: 't5', at: 19 * 60 + 30, prompt: 'What did I do today to protect my identity, and not out of real desire?', hint: 'Koe’s hint: it is most of what you do.' },
      { id: 't6', at: 21 * 60, prompt: 'When did I feel most alive today? When did I feel most dead?' }
    ],
    extraTitle: 'For the gaps',
    extraIntro: 'Think about these while you are commuting, walking or lying around.',
    extras: [
      { id: 'c1', prompt: 'What would change if I stopped needing people to see me as the identity I named this morning?', recall: { key: 'a7', label: 'The identity you would give up' } },
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
        intro: 'By now you should have at least one insight that could change your course. Write it down so it sticks.',
        questions: [
          { id: 'e1', prompt: 'After today, what feels most true about why you have been stuck?' },
          { id: 'e2', prompt: 'What is the actual enemy?', hint: 'Name it clearly. Not circumstances and not other people: the internal pattern or belief that has been running the show.' },
          { id: 'antiVision', prompt: 'In one sentence: what do you refuse to let your life become?', hint: 'Your anti-vision, compressed. It should make you feel something when you read it.' },
          { id: 'vision', prompt: 'In one sentence: what are you building toward?', hint: 'Your first-version vision. It will evolve.' }
        ]
      },
      {
        name: 'Goals as lenses',
        intro: 'Koe doesn’t mean goals as finish lines. A goal is a lens you look through to see the next right action. Don’t worry about arriving: the enjoyment is in the progress.',
        questions: [
          { id: 'year', prompt: 'One year from now, what would have to be true for you to know you have broken the old pattern?', hint: 'One concrete thing.' },
          { id: 'month', prompt: 'One month from now, what would have to be true for that one-year lens to stay possible?' },
          { id: 'daily', prompt: 'What two or three actions can you time-block tomorrow that the person you are becoming would simply do?', hint: 'One per line. These become your daily quests on the game board.', placeholder: 'One action per line' }
        ]
      },
      {
        name: 'Rules',
        intro: 'One last piece before the game board. A game needs rules.',
        questions: [
          { id: 'constraints', prompt: 'What are you not willing to sacrifice to reach your vision?', hint: 'Limits rule out the lazy routes and push you toward creative ones.' }
        ]
      }
    ],
    done: { label: 'See your game board', route: 'game' }
  },

  game: {
    eyebrow: 'Game board',
    title: 'Your life, set up as a game',
    intro: 'Games are built for focus: a way to win, something at stake, a mission, rules. Koe’s last step is to arrange what you found today into the same six pieces, so they surround your attention like rings of a forcefield and keep distractions out. Edit any of them here.',
    tiles: [
      { key: 'antiVision', name: 'Anti-vision', mechanic: 'What’s at stake', prompt: 'The life you never want to experience again. What happens if you lose or give up.' },
      { key: 'vision', name: 'Vision', mechanic: 'How you win', prompt: 'The ideal life you think you want. It improves as you work toward it.' },
      { key: 'year', name: 'One-year goal', mechanic: 'The mission', prompt: 'What your life looks like in a year. Your sole priority until then.' },
      { key: 'month', name: 'One-month project', mechanic: 'The boss fight', prompt: 'What you need to learn or build this month. This is where you gain XP and loot.' },
      { key: 'daily', name: 'Daily levers', mechanic: 'Daily quests', prompt: 'The priority tasks that move the project forward. One per line.' },
      { key: 'constraints', name: 'Constraints', mechanic: 'The rules', prompt: 'What you will not sacrifice. Limits encourage creativity.' }
    ]
  }
};
