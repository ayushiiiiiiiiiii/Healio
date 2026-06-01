const mongoose = require('mongoose');
require('dotenv').config();

const Wellness = require('./models/Wellness');
const Affirmation = require('./models/Affirmation');

const wellnessResources = [
  {
    title: "Box Breathing Technique",
    description: "A simple 4-count breathing technique to reduce anxiety and calm the nervous system",
    category: "breathing",
    content: "Box breathing, also known as square breathing, is a technique to calm your nervous system and reduce stress.",
    instructions: [
      "Exhale completely through your mouth",
      "Close your mouth and inhale through your nose for a count of 4",
      "Hold your breath for a count of 4",
      "Exhale through your mouth for a count of 4",
      "Hold empty for a count of 4",
      "Repeat 5-10 times"
    ],
    benefits: ["Reduces anxiety", "Lowers blood pressure", "Improves focus", "Calms nervous system"],
    targetEmotions: ["anxious", "overwhelmed", "angry"],
    duration: 5,
    difficulty: "easy",
    tags: ["breathing", "anxiety-relief", "stress-management"]
  },
  {
    title: "Progressive Muscle Relaxation",
    description: "Systematically tense and release muscle groups to release physical tension and promote relaxation",
    category: "stretching",
    content: "Progressive muscle relaxation (PMR) is a technique that involves tensing and then releasing different muscle groups.",
    instructions: [
      "Find a comfortable lying or sitting position",
      "Start with your feet - tense for 5 seconds, then release",
      "Move to your calves - tense for 5 seconds, then release",
      "Continue up your body (thighs, glutes, abdomen, chest, arms, shoulders, neck, face)",
      "Notice the difference between tension and relaxation",
      "Take slow, deep breaths throughout"
    ],
    benefits: ["Releases physical tension", "Reduces stress", "Improves sleep", "Increases body awareness"],
    targetEmotions: ["anxious", "overwhelmed", "sad"],
    duration: 15,
    difficulty: "easy",
    tags: ["relaxation", "physical-wellness", "sleep-aid"]
  },
  {
    title: "5-4-3-2-1 Grounding Technique",
    description: "Grounding technique using five senses to anchor you to the present moment during anxiety or panic",
    category: "grounding",
    content: "The 5-4-3-2-1 technique helps ground you in the present moment by engaging your five senses.",
    instructions: [
      "Notice 5 things you can see - colors, textures, shapes",
      "Notice 4 things you can physically feel - temperature, texture, pressure",
      "Notice 3 things you can hear - sounds around you",
      "Notice 2 things you can smell - pleasant scents in your environment",
      "Notice 1 thing you can taste - a flavor on your tongue",
      "Take a deep breath and notice how you feel"
    ],
    benefits: ["Reduces anxiety", "Brings focus to present", "Manages panic attacks", "Increases mindfulness"],
    targetEmotions: ["anxious", "overwhelmed", "angry"],
    duration: 5,
    difficulty: "easy",
    tags: ["grounding", "anxiety-relief", "mindfulness"]
  },
  {
    title: "Body Scan Meditation",
    description: "A guided meditation moving awareness through your body to release tension and promote relaxation",
    category: "meditation",
    content: "Body scan meditation helps you become aware of and release tension held in different parts of your body.",
    instructions: [
      "Lie down on your back in a comfortable position",
      "Close your eyes and take 3 deep breaths",
      "Start at the top of your head and slowly move awareness down",
      "Notice any tension or sensations without judgment",
      "Imagine breathing into tense areas and releasing them",
      "Continue until you reach your toes",
      "Rest for a few minutes before slowly opening your eyes"
    ],
    benefits: ["Reduces muscle tension", "Promotes relaxation", "Improves body awareness", "Better sleep"],
    targetEmotions: ["sad", "anxious", "overwhelmed"],
    duration: 20,
    difficulty: "medium",
    tags: ["meditation", "relaxation", "sleep-aid"]
  },
  {
    title: "4-7-8 Breathing Technique",
    description: "Advanced breathing technique for deep relaxation and better sleep quality",
    category: "breathing",
    content: "The 4-7-8 breathing technique is a powerful tool for relaxation and sleep.",
    instructions: [
      "Exhale completely through your mouth",
      "Close your mouth and inhale through nose for count of 4",
      "Hold your breath for count of 7",
      "Exhale completely through mouth for count of 8",
      "Repeat 4 more times",
      "You may feel lightheaded - stop if uncomfortable"
    ],
    benefits: ["Deep relaxation", "Improves sleep", "Reduces anxiety", "Calms racing thoughts"],
    targetEmotions: ["anxious", "calm", "overwhelmed"],
    duration: 10,
    difficulty: "medium",
    tags: ["breathing", "sleep-aid", "anxiety-relief"]
  },
  {
    title: "Mindfulness Meditation",
    description: "Simple mindfulness practice to develop present-moment awareness and reduce stress",
    category: "meditation",
    content: "Mindfulness meditation cultivates non-judgmental awareness of the present moment.",
    instructions: [
      "Find a quiet, comfortable place to sit",
      "Close your eyes and focus on your natural breath",
      "When your mind wanders, gently bring attention back to breath",
      "Notice thoughts and feelings without judgment",
      "Continue for 10-20 minutes",
      "Slowly open your eyes and notice how you feel"
    ],
    benefits: ["Reduces stress", "Improves focus", "Enhances emotional regulation", "Increases peace"],
    targetEmotions: ["anxious", "calm", "happy"],
    duration: 15,
    difficulty: "medium",
    tags: ["meditation", "mindfulness", "stress-relief"]
  },
  {
    title: "Loving-Kindness Meditation",
    description: "A compassion meditation that cultivates love and kindness toward yourself and others",
    category: "meditation",
    content: "Loving-kindness meditation develops compassion and reduces negative emotions.",
    instructions: [
      "Sit comfortably and close your eyes",
      "Think of someone you love and feel the warmth",
      "Silently repeat: May I be happy, May I be healthy, May I be peaceful",
      "Extend wishes to others: May you be happy...",
      "Then extend to all beings everywhere",
      "Notice any shift in your mood"
    ],
    benefits: ["Increases compassion", "Reduces anger", "Improves relationships", "Builds self-love"],
    targetEmotions: ["angry", "sad", "grateful"],
    duration: 15,
    difficulty: "medium",
    tags: ["meditation", "compassion", "self-love"]
  },
  {
    title: "Gentle Yoga Stretch",
    description: "Beginner-friendly yoga stretches to release tension and increase flexibility",
    category: "stretching",
    content: "Gentle yoga movements to calm the mind and body while releasing physical tension.",
    instructions: [
      "Neck rolls: Slow circular motions, 5 times each direction",
      "Shoulder shrugs: Lift shoulders to ears, hold 3 seconds, release",
      "Child's pose: Kneel, stretch arms forward, rest forehead on mat",
      "Cat-cow stretch: Alternate between arching and rounding your spine",
      "Seated forward fold: Reach toward your toes gently",
      "End with deep breathing"
    ],
    benefits: ["Releases physical tension", "Improves flexibility", "Calms nervous system", "Reduces muscle pain"],
    targetEmotions: ["anxious", "overwhelmed", "sad"],
    duration: 10,
    difficulty: "easy",
    tags: ["yoga", "stretching", "physical-wellness"]
  },
  {
    title: "Stress Management Tips",
    description: "Practical strategies for managing daily stress and maintaining emotional wellness",
    category: "tips",
    content: "Evidence-based stress management techniques for daily well-being.",
    instructions: [
      "Set realistic goals and prioritize tasks",
      "Take regular breaks throughout your day",
      "Practice saying 'no' to reduce overwhelm",
      "Maintain a regular sleep schedule",
      "Exercise for at least 30 minutes daily",
      "Connect with supportive people regularly",
      "Practice relaxation techniques daily",
      "Limit caffeine and alcohol intake"
    ],
    benefits: ["Reduces overall stress", "Improves mental health", "Better work-life balance", "Increases resilience"],
    targetEmotions: ["anxious", "overwhelmed", "calm"],
    duration: 5,
    difficulty: "easy",
    tags: ["stress-management", "wellness", "self-care"]
  },
  {
    title: "Sleep Hygiene Guide",
    description: "Evidence-based practices to improve sleep quality and establish healthy sleep patterns",
    category: "tips",
    content: "Good sleep hygiene improves sleep quality and overall health.",
    instructions: [
      "Go to bed and wake up at the same time daily",
      "Keep bedroom cool, dark, and quiet",
      "Avoid screens 1 hour before bed",
      "Avoid caffeine after 2 PM",
      "Exercise regularly but not close to bedtime",
      "Use bed only for sleep and intimacy",
      "Try relaxation techniques before bed",
      "Keep a consistent pre-sleep routine"
    ],
    benefits: ["Better sleep quality", "Improved energy", "Better mood", "Enhanced immunity"],
    targetEmotions: ["sad", "overwhelmed", "calm"],
    duration: 5,
    difficulty: "easy",
    tags: ["sleep", "wellness", "self-care"]
  },
  {
    title: "Anxiety Relief Techniques",
    description: "Quick techniques to manage anxiety symptoms in the moment",
    category: "tips",
    content: "Evidence-based techniques to manage acute anxiety.",
    instructions: [
      "Practice deep breathing (in for 4, hold for 4, out for 4)",
      "Use the grounding 5-4-3-2-1 technique",
      "Move your body - walk, stretch, or exercise",
      "Challenge anxious thoughts with evidence",
      "Practice progressive muscle relaxation",
      "Reach out to someone you trust",
      "Limit caffeine and sugar intake",
      "Practice acceptance of the anxiety without fighting it"
    ],
    benefits: ["Reduces anxiety symptoms", "Increases sense of control", "Improves coping skills", "Builds confidence"],
    targetEmotions: ["anxious", "overwhelmed"],
    duration: 10,
    difficulty: "easy",
    tags: ["anxiety-relief", "coping-skills", "mental-health"]
  },
  {
    title: "Journaling for Mental Health",
    description: "Therapeutic journaling prompts to process emotions and improve self-awareness",
    category: "tips",
    content: "Journaling is a powerful tool for emotional processing and self-discovery.",
    instructions: [
      "Set aside 10-15 minutes in a quiet space",
      "Write freely without judging your thoughts",
      "Explore your emotions and what triggered them",
      "Write about gratitude and positive moments",
      "Process challenging situations through writing",
      "Reflect on patterns in your emotions and behavior",
      "Use prompts to guide your writing",
      "Review past entries to track progress"
    ],
    benefits: ["Processes emotions", "Increases self-awareness", "Reduces stress", "Improves mental clarity"],
    targetEmotions: ["sad", "anxious", "overwhelmed"],
    duration: 15,
    difficulty: "easy",
    tags: ["journaling", "self-reflection", "mental-health"]
  },
  {
    title: "Happiness Boost Activities",
    description: "Science-backed activities that naturally increase happiness and well-being",
    category: "tips",
    content: "Activities proven to increase happiness and positive emotions.",
    instructions: [
      "Spend time in nature for at least 20 minutes",
      "Practice gratitude - write 3 things you're grateful for",
      "Do an act of kindness for someone else",
      "Engage in a hobby you enjoy",
      "Spend quality time with loved ones",
      "Exercise for mood-boosting endorphins",
      "Listen to uplifting music",
      "Practice meditation or mindfulness"
    ],
    benefits: ["Increases happiness", "Improves mood", "Enhances life satisfaction", "Builds positive habits"],
    targetEmotions: ["happy", "grateful", "hopeful"],
    duration: 20,
    difficulty: "easy",
    tags: ["happiness", "well-being", "self-care"]
  },
  {
    title: "Anger Management Techniques",
    description: "Healthy strategies for processing and expressing anger constructively",
    category: "tips",
    content: "Healthy ways to manage and express anger.",
    instructions: [
      "Recognize physical signs of anger early",
      "Take deep breaths to calm your nervous system",
      "Step away from the situation temporarily",
      "Practice the 10-minute rule before responding",
      "Use 'I' statements to express your feelings",
      "Channel anger into physical activity",
      "Write your angry thoughts without filtering",
      "Seek to understand the other person's perspective"
    ],
    benefits: ["Reduces anger intensity", "Improves communication", "Prevents regrettable actions", "Builds emotional maturity"],
    targetEmotions: ["angry", "overwhelmed"],
    duration: 10,
    difficulty: "medium",
    tags: ["anger-management", "emotional-regulation", "communication"]
  },
  {
    title: "Self-Compassion Exercise",
    description: "Practice treating yourself with the same kindness and support you'd give a good friend",
    category: "meditation",
    content: "Self-compassion is the foundation of emotional well-being.",
    instructions: [
      "Acknowledge that you're struggling (self-kindness)",
      "Remember that difficult emotions are part of being human (common humanity)",
      "Avoid harsh self-judgment (mindfulness)",
      "Place your hand on your heart",
      "Silently say: 'This is a moment of suffering. Suffering is part of life. I am not alone.'",
      "Extend compassion to yourself as you would a friend",
      "Take several deep, compassionate breaths"
    ],
    benefits: ["Reduces self-criticism", "Increases self-love", "Improves resilience", "Better mental health"],
    targetEmotions: ["sad", "overwhelmed", "grateful"],
    duration: 10,
    difficulty: "medium",
    tags: ["self-compassion", "self-love", "mental-health"]
  },
  {
    title: "Nature Connection Practice",
    description: "Mindful outdoor activities that reconnect you with nature and reduce stress",
    category: "grounding",
    content: "Nature connection has powerful healing effects on mental health.",
    instructions: [
      "Find a quiet outdoor space (park, garden, forest)",
      "Sit comfortably and observe your surroundings",
      "Notice colors, textures, sounds, and smells",
      "Feel the ground beneath you",
      "Watch clouds, water, or leaves moving",
      "Breathe in fresh air slowly and deeply",
      "Let go of thoughts and simply be present",
      "Spend at least 20 minutes in this state"
    ],
    benefits: ["Reduces stress", "Improves mood", "Increases sense of calm", "Enhances perspective"],
    targetEmotions: ["anxious", "sad", "calm"],
    duration: 30,
    difficulty: "easy",
    tags: ["nature", "grounding", "stress-relief"]
  },
  {
    title: "Energy Boost Movement",
    description: "Quick energizing movements to combat fatigue and low mood",
    category: "stretching",
    content: "Quick physical movements to increase energy and improve mood.",
    instructions: [
      "Stand with feet shoulder-width apart",
      "Reach arms up and stretch for 5 seconds",
      "Do 10 arm circles forward, 10 backward",
      "March in place for 30 seconds",
      "Do 10 jumping jacks",
      "Shake out your whole body for 10 seconds",
      "Return to normal breathing",
      "Notice the increase in energy and mood"
    ],
    benefits: ["Increases energy", "Improves mood", "Boosts circulation", "Enhances focus"],
    targetEmotions: ["sad", "overwhelmed", "happy"],
    duration: 5,
    difficulty: "easy",
    tags: ["movement", "energy-boost", "exercise"]
  }
];

const affirmations = [
  // Happy affirmations
  { text: "I am grateful for the joy that flows through my life", emotion: "happy", category: "gratitude", author: "Wellness Expert", tags: ["joy", "gratitude"] },
  { text: "Today I choose to celebrate my wins, no matter how small", emotion: "happy", category: "self-love", author: "Wellness Expert", tags: ["celebration", "achievement"] },
  { text: "My happiness is contagious and spreads to others", emotion: "happy", category: "self-love", author: "Wellness Expert", tags: ["joy", "positivity"] },
  { text: "I deserve to experience joy and happiness every day", emotion: "happy", category: "self-love", author: "Wellness Expert", tags: ["worthiness", "joy"] },
  { text: "Life is full of beautiful moments waiting to be discovered", emotion: "happy", category: "strength", author: "Wellness Expert", tags: ["abundance", "positivity"] },

  // Sad affirmations
  { text: "It is okay to feel sad; this too shall pass", emotion: "sad", category: "resilience", author: "Wellness Expert", tags: ["acceptance", "healing"] },
  { text: "My emotions are valid and important", emotion: "sad", category: "self-love", author: "Wellness Expert", tags: ["validation", "emotions"] },
  { text: "I am deserving of compassion, especially from myself", emotion: "sad", category: "self-love", author: "Wellness Expert", tags: ["compassion", "self-love"] },
  { text: "Sadness is temporary and I am strong enough to get through it", emotion: "sad", category: "strength", author: "Wellness Expert", tags: ["strength", "resilience"] },
  { text: "I am allowed to grieve and process my emotions at my own pace", emotion: "sad", category: "resilience", author: "Wellness Expert", tags: ["acceptance", "healing"] },

  // Anxious affirmations
  { text: "I am safe in this moment", emotion: "anxious", category: "mindfulness", author: "Wellness Expert", tags: ["safety", "present"] },
  { text: "My worries do not define me", emotion: "anxious", category: "resilience", author: "Wellness Expert", tags: ["identity", "strength"] },
  { text: "I choose calm over control", emotion: "anxious", category: "mindfulness", author: "Wellness Expert", tags: ["acceptance", "calm"] },
  { text: "I can handle what comes my way", emotion: "anxious", category: "strength", author: "Wellness Expert", tags: ["capability", "strength"] },
  { text: "My anxiety is a signal, not a prophecy", emotion: "anxious", category: "resilience", author: "Wellness Expert", tags: ["perspective", "growth"] },

  // Calm affirmations
  { text: "I am at peace with myself and my life", emotion: "calm", category: "mindfulness", author: "Wellness Expert", tags: ["peace", "acceptance"] },
  { text: "Serenity flows through me with each breath", emotion: "calm", category: "mindfulness", author: "Wellness Expert", tags: ["peace", "breathwork"] },
  { text: "I breathe in calm and breathe out stress", emotion: "calm", category: "mindfulness", author: "Wellness Expert", tags: ["breathwork", "stress-relief"] },
  { text: "I am grounded and present in this moment", emotion: "calm", category: "mindfulness", author: "Wellness Expert", tags: ["grounding", "presence"] },
  { text: "Peace is my natural state of being", emotion: "calm", category: "mindfulness", author: "Wellness Expert", tags: ["peace", "identity"] },

  // Angry affirmations
  { text: "I can feel my anger and choose my response", emotion: "angry", category: "resilience", author: "Wellness Expert", tags: ["empowerment", "choice"] },
  { text: "My boundaries matter and I defend them with love", emotion: "angry", category: "strength", author: "Wellness Expert", tags: ["boundaries", "self-respect"] },
  { text: "I am learning to channel my power constructively", emotion: "angry", category: "growth", author: "Wellness Expert", tags: ["growth", "empowerment"] },
  { text: "My anger is valid and I express it healthily", emotion: "angry", category: "resilience", author: "Wellness Expert", tags: ["validation", "expression"] },
  { text: "I release anger that no longer serves me", emotion: "angry", category: "healing", author: "Wellness Expert", tags: ["release", "healing"] },

  // Hopeful affirmations
  { text: "Better days are coming and I am ready for them", emotion: "hopeful", category: "strength", author: "Wellness Expert", tags: ["future", "optimism"] },
  { text: "My future is bright with infinite possibilities", emotion: "hopeful", category: "strength", author: "Wellness Expert", tags: ["future", "potential"] },
  { text: "I believe in my ability to create positive change", emotion: "hopeful", category: "strength", author: "Wellness Expert", tags: ["empowerment", "change"] },
  { text: "Every challenge is an opportunity for growth", emotion: "hopeful", category: "resilience", author: "Wellness Expert", tags: ["growth", "perspective"] },
  { text: "I am moving toward my dreams with purpose and passion", emotion: "hopeful", category: "strength", author: "Wellness Expert", tags: ["purpose", "dreams"] },

  // Overwhelmed affirmations
  { text: "I can handle one thing at a time, and that is enough", emotion: "overwhelmed", category: "resilience", author: "Wellness Expert", tags: ["presence", "acceptance"] },
  { text: "I am strong enough to overcome this moment", emotion: "overwhelmed", category: "strength", author: "Wellness Expert", tags: ["strength", "courage"] },
  { text: "Progress over perfection is my mantra", emotion: "overwhelmed", category: "growth", author: "Wellness Expert", tags: ["progress", "acceptance"] },
  { text: "I give myself permission to slow down", emotion: "overwhelmed", category: "self-love", author: "Wellness Expert", tags: ["rest", "self-care"] },
  { text: "This feeling is temporary and I will get through it", emotion: "overwhelmed", category: "resilience", author: "Wellness Expert", tags: ["resilience", "hope"] },

  // Grateful affirmations
  { text: "I am surrounded by abundance and blessings", emotion: "grateful", category: "gratitude", author: "Wellness Expert", tags: ["abundance", "appreciation"] },
  { text: "Gratitude opens my heart to infinite possibilities", emotion: "grateful", category: "gratitude", author: "Wellness Expert", tags: ["gratitude", "openness"] },
  { text: "I appreciate all that I have and all that I am", emotion: "grateful", category: "gratitude", author: "Wellness Expert", tags: ["appreciation", "self-love"] },
  { text: "Every day brings new reasons to be grateful", emotion: "grateful", category: "gratitude", author: "Wellness Expert", tags: ["daily-practice", "gratitude"] },
  { text: "I am thankful for my growth and my journey", emotion: "grateful", category: "gratitude", author: "Wellness Expert", tags: ["growth", "appreciation"] }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Wellness.deleteMany({});
    await Affirmation.deleteMany({});
    console.log('🧹 Cleared existing wellness resources and affirmations');

    // Insert wellness resources
    const createdWellness = await Wellness.insertMany(wellnessResources);
    console.log(`✅ Seeded ${createdWellness.length} wellness resources`);

    // Insert affirmations
    const createdAffirmations = await Affirmation.insertMany(affirmations);
    console.log(`✅ Seeded ${createdAffirmations.length} affirmations`);

    // Verify counts
    const wellnessCount = await Wellness.countDocuments();
    const affirmationCount = await Affirmation.countDocuments();
    console.log(`\n📊 Final counts:`);
    console.log(`   Wellness resources: ${wellnessCount}`);
    console.log(`   Affirmations: ${affirmationCount}`);

    // Verify affirmations per emotion
    const emotionCounts = await Affirmation.aggregate([
      { $group: { _id: '$emotion', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log(`\n😊 Affirmations per emotion:`);
    emotionCounts.forEach(({ _id, count }) => {
      console.log(`   ${_id}: ${count} affirmations`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();
