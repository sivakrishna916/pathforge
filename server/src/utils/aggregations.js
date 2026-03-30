// server/src/utils/aggregations.js

export const getRankedStoriesPipeline = (segment, skip = 0, limit = 10) => [

  // Stage 1 — only show approved stories, filter by segment if provided
  {
    $match: {
      status: 'approved',
      ...(segment && segment !== 'all' ? { segment } : {})
    }
  },

  // Stage 2 — compute engagement score for each story
  // Formula: (upvotes x 0.5) + (saves x 0.3) + (recency x 0.2)
  {
    $addFields: {
      recencyBoost: {
        $cond: {
          if: {
            $gte: [
              '$createdAt',
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // last 30 days
            ]
          },
          then: 10,  // recent stories get a boost on same scale as votes
          else: 0
        }
      },
      engagementScore: {
        $add: [
          { $multiply: ['$upvotes', 0.5] },
          { $multiply: ['$saves', 0.3] },
        ]
      }
    }
  },

  // Add recency into the final score in a second addFields
  // (MongoDB can't reference a field computed in the same $addFields stage)
  {
    $addFields: {
      engagementScore: {
        $add: ['$engagementScore', { $multiply: ['$recencyBoost', 0.2] }]
      }
    }
  },

  // Stage 3 — sort by computed score, newest first as tiebreaker
  { $sort: { engagementScore: -1, createdAt: -1 } },

  // Stage 4 — pagination
  { $skip: skip },
  { $limit: limit },

  // Stage 5 — join author details from users collection
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
      pipeline: [
        { $project: { name: 1, avatar: 1, segment: 1 } }
      ]
    }
  },

  // Stage 6 — $lookup always returns array, unwrap to single object
  { $unwind: '$author' },

  // Stage 7 — only send what frontend needs, hide internal fields
  {
    $project: {
      title: 1,
      background: 1,
      decision: 1,
      outcome: 1,
      regrets: 1,
      segment: 1,
      tags: 1,
      upvotes: 1,
      saves: 1,
      engagementScore: 1,
      image: 1,
      createdAt: 1,
      author: 1,
    }
  }
]