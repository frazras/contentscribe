suggestion_keywords_analysis = """
You are an expert in SEO and data-driven marketing strategies. You am familiar with analyzing keyword data, including metrics like search volume, paid competitors, SEO difficulty, and cost per click.
Using the provided [Keyword_data] categorized into various themes as follows:

Questions: Keywords starting with 'who', 'what', 'where', 'when', 'why', 'how', 'are'.
Prepositions: Keywords including 'can', 'with', 'for'.
Alphabet: Keywords beginning with each letter from A to Z.
Comparisons: Keywords containing 'vs', 'versus', 'or'.
Intent-Based: Keywords with 'buy', 'review', 'price', 'best', 'top', 'how to', 'why to'.
Time-Related: Keywords related to 'when', 'schedule', 'deadline', 'today', 'now', 'latest'.
Audience-Specific: Keywords like 'for beginners', 'for small businesses', 'for students', 'for professionals'.
Problem-Solving: Keywords around 'solution', 'issue', 'error', 'troubleshoot', 'fix'.
Feature-Specific: Keywords with 'with video', 'with images', 'analytics', 'tools', 'with example'.
Opinions/Reviews: Keywords including 'review', 'opinion', 'rating', 'feedback', 'testimonial'.
Cost-Related: Keywords about 'price', 'cost', 'budget', 'cheap', 'expensive', 'value'.
Trend-Based: Keywords like 'trends', 'new', 'upcoming'.

Please analyze these keyword suggestions and provide SEO strategy advice for each category. Focus on:

Content Strategy: Suggest types of content and approaches that could be effective for targeting keywords in each category.
Audience Engagement: Offer insights into how to engage different audience segments based on the keyword categories.
Competitor Analysis: Briefly discuss potential competitive landscapes for these keyword categories.
Long-Term SEO Planning: Provide ideas on incorporating these keywords into a broader SEO strategy, considering their categorical themes.

Provide a list of 7-10 bullet-point suggestions on how to use these keywords, highlighting unique opportunities and challenges they present.


[Keyword_data]: {KEYWORD_DATA}

"""

heading_aggregation = """
For the following Heading_data, create a comprehensive list of headings by removing all duplicates, alternate ordering of the same words and phrasing of words or the same idea. 
Ensure the new flat list maintains all the words in each heading.
Return the list of headings as json in the form "headings": {{[heading1, heading2, heading3, ...]}} grouping relevant headings to each other(not alphabetically, but categorically eg, foods, cities, dates).
You MUST return a single list of headings, no exceptions. Please prioritize the grouping of headings based on their relevance to each other.
Do not duplicate or pad headings, you wil be harshly punished for returning duplicates. Valid Json must be returned as your response - no explanations, no notes.
Anything except a valid json response will cause critical application failure, I'm sure you will be punished for that.
Do not prefix the word json. The result should be valid for the python function json.loads, do not return truncated json.
Do not use markdown, that will cause syntax errors in my code, return no more than 100 headings.

[Heading_data]: {HEADING_DATA}

"""

keyword_aggregation = """

For the following Keyword_data, create a comprehensive list of keywords by removing all duplicates,
pluralizations, alternate ordering and phrasing of words or the same idea, grouping of related keywords.
Ensure the new list maintains search intent and does not significantly change the word usage.
Return the list of keywords as json in the form "keywords": {{[keyword1, keyword2, keyword3, ...]}} and sorted by relevance to each other
but do not duplicate or pad keywords, you wil be harshly punished for returning duplicates. Valid Json must be returned as your response - no explanations, no notes.
Anything except a valid json response will cause critical application failure, I'm sure you will be punished for that.
Do not prefix the word json. The result should be valid for the python function json.loads, do not return truncated json.
Do not use markdown, do not use the markdown syntax ```json, that will cause syntax errors in my code, return no more than 100 keywords.

[Keyword_data]: {KEYWORD_DATA}


"""

title_gen = """
Given the following main keyword {INPUT_KEYWORD} and supporting keywords {SELECTED_KEYWORDS}, generate 25 creative and catchy article title suggestions, the 15 first titles should include a number at the beginning. 
The titles should incorporate best practices for engaging and traffic-driving headlines, including the use of numbers, 
clarity, direct address to the reader, and emotional or power words. The main keyword should be prominently featured in all titles. Also, attempt to vary the titles by including odd numbers, 
using superlatives, and posing questions. Reflect on incorporating the principles shared by Brandon Gaille, ensuring the titles are concise, 
clear, and tailored to potentially improve Google rankings and social shares.
The current top ranking articles in google use the titles {SELECTED_ARTICLES} and the headings {SELECTED_HEADINGS}. 
Take these titles and headings and incorporate them into your suggestions.
The response should be a json in the form "titles": {{[title1, title2, title3, ...]}} and no explanations or notes.
Anything except a valid json response will cause critical application failure, I'm sure you will be punished for that.
Do not prefix the word json. The result should be valid for the python function json.loads, do not return truncated json.
Do not use markdown, that will cause syntax errors in my code.


"""

outline_gen = """
Given the main keyword {INPUT_KEYWORD} and supporting keywords {SELECTED_KEYWORDS}, generate an SEO-optimized article outline with the title {TITLE}. 
The outline should incorporate best practices for engaging, attention-grabbing headlines, and include a suitable number of headers (H2) and sub-headers (H3) to cover the article's content comprehensively.

From the title and keyowords, determine the target audience and keep this audience in mind to ensure the content is relevant and engaging for them.

Headers should be skimmable, clear, and use emotional or power words.
Current top-ranking articles on Google use the article titles {SELECTED_ARTICLES} and the headings {SELECTED_HEADINGS}. 
You can implicitly or explicitly incorporate these titles and headings into your suggestions as required.

Understand the search intent behind the main keyword and ensure the outline addresses it effectively.

Identify gaps in the content covered by top-ranking articles and include unique insights or original research from the supporting keywords and headers to provide higher information gain.

Each heading should be descriptive, answering a question directly related to the title or demonstrating the next step. Think about what Google's "People Also Ask" section as inspiration for headings.

Refine your outline for clarity and flow. Ensure sections and headings have a logical flow by reading them aloud. Adjust the order of sections if needed to ensure a logical progression of ideas.
If necessary, add multiple subheadings to improve the information hierarchy. 

The response should be a JSON in the form: "outline": [{"heading1": ["subheading1", "subheading2", ...]}, {"heading2": ["subheading3", "subheading4", ...]}, ...]. 
No explanations or notes should be included.

Ensure the response is valid JSON and does not include markdown, do not use the markdown syntax ```json or else I will get syntax errors in the code.
"""

