// server/src/controllers/quizController.js

import Question from '../models/Question.js';
import QuizResult from '../models/QuizResult.js';
import { computeTraitScores } from '../services/scoringService.js';

// 👉 GET ALL QUESTIONS
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question
      .find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👉 SUBMIT QUIZ
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    // safety check
    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "Answers are required" });
    }

    // fetch all questions
    const questions = await Question.find();

    // compute result
    const { traitScores, dominantTrait, recommendedClusters } =
      computeTraitScores(questions, answers);

    // save result
    const result = await QuizResult.create({
      user: req.user._id,
      answers: answers.map(({ questionId, selectedIndex }) => ({
        questionId,
        selectedOption: selectedIndex,
      })),
      traitScores,
      dominantTrait,
      careerCluster: recommendedClusters[0] || 'general',
    });

    res.status(201).json({
      traitScores,
      dominantTrait,
      recommendedClusters,
      resultId: result._id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// 👉 GET USER RESULTS
export const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(results);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};