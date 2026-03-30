// server/src/services/scoringService.js

const TRAIT_TO_CLUSTER = {
  analytical: ['Software Engineering', 'Data Science', 'Finance', 'Law', 'Architecture'],
  creative:   ['UI/UX Design', 'Content & Media', 'Advertising', 'Game Design', 'Fashion'],
  social:     ['Teaching', 'Psychology', 'HR', 'Healthcare', 'Social Work'],
  practical:  ['Entrepreneurship', 'Civil Engineering', 'Trades', 'Agriculture', 'Manufacturing'],
  academic:   ['Research', 'Civil Services (UPSC)', 'Medicine', 'Pure Sciences', 'Academia'],
};

const computeTraitScores = (questions, answers) => {
  const totals = {
    analytical: 0,
    creative: 0,
    social: 0,
    practical: 0,
    academic: 0
  };

  answers.forEach(({ questionId, selectedIndex }) => {
    const question = questions.find(
      q => q._id.toString() === questionId
    );

    if (!question) return;

    const selectedOption = question.options[selectedIndex];
    if (!selectedOption) return;

    const selectedScores = selectedOption.scores || {};

    Object.keys(totals).forEach(trait => {
      totals[trait] += selectedScores[trait] || 0;
    });
  });

  const dominantTrait = Object.keys(totals).reduce((a, b) =>
    totals[a] > totals[b] ? a : b
  );

  const recommendedClusters = TRAIT_TO_CLUSTER[dominantTrait] || [];

  return {
    traitScores: totals,
    dominantTrait,
    recommendedClusters,
  };
};

export { computeTraitScores };