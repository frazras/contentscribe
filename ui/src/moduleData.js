const moduleData = [
  {
    order: 0,
    name: "Main Keyword",
    component: 'MainKeyword',
    prerequisites: [],
    executionTime: 0,
    hasProgressBar: false,
    buttonLabel: "Get Main Keyword",
    renderProgressMessage: null
  },
  {
    order: 1,
    name: "Keyword Research",
    component: 'KeywordResearch',
    prerequisites: ["MainKeyword"],
    executionTime: 60,
    hasProgressBar: true,
    buttonLabel: "Perform Keyword Research",
    renderProgressMessage: {
      5: "Analyzing Keywords...",
      10: "Generating Keyword Variations...",
      30: "Using AI to Categorize and Rank Keyword Variations...",
      60: "Removing Duplicates and Contextually Similar Keyword Variations...",
      80: "Semantically Grouping Keyword Variations...",
      99: "Wrapping up...",
      100: "Complete! ...But it looks like there are a few extra things to iron out, please give it a few more seconds"
    }
  },
  {
    order: 2,
    name: "Research Similar Articles",
    component: 'SimilarArticles',
    prerequisites: ["KeywordResearch"],
    executionTime: 90,
    hasProgressBar: true,
    buttonLabel: "Analyze Articles",
    renderProgressMessage: null
  },
  {
    order: 3,
    name: "Select Headings",
    component: 'Headings',
    prerequisites: ["SimilarArticles"],
    executionTime: 45,
    hasProgressBar: true,
    buttonLabel: "Select Headings",
    renderProgressMessage: null
  },
  {
    order: 4,
    name: "Titles",
    component: 'Titles',
    prerequisites: ["Headings"],
    executionTime: 180,
    hasProgressBar: true,
    buttonLabel: "Select a Title",
    renderProgressMessage: null
  },
  {
    order: 5,
    name: "Article Outline",
    component: 'ArticleOutline',
    prerequisites: ["Titles"],
    executionTime: 120,
    hasProgressBar: true,
    buttonLabel: "Generate Article Outline",
    renderProgressMessage: null
  },
  {
    order: 6,
    name: "Article Generation",
    component: 'ArticleGeneration',
    prerequisites: ["ArticleOutline"],
    executionTime: 60,
    hasProgressBar: true,
    buttonLabel: "Generate Article",
    renderProgressMessage: null
  }
];

export default moduleData;