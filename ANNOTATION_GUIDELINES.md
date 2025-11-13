
# 📋 Detailed Annotation Guidelines

## Table of Contents
1. [General Principles](#general-principles)
2. [Task 1: Completion Judgment](#task-1-completion-judgment)
3. [Task 2: Completion Writing](#task-2-completion-writing)
4. [Common Pitfalls & Edge Cases](#common-pitfalls--edge-cases)
5. [Language-Specific Notes](#language-specific-notes)
6. [Self-Review Checklist](#self-review-checklist)

---

## General Principles

### 🌟 Core Values
- **Cultural Authenticity**: We represent cultures as they truly are, not as stereotypes suggest
- **Linguistic Pride**: Every language deserves natural, fluent, respectful representation
- **Intellectual Humility**: When uncertain, research rather than guess
- **Constructive Curiosity**: View each example as a learning opportunity

### 🎯 What is "Cultural Alignment"?
A completion is **culturally aligned** when:
- It reflects **current, widely accepted** practices/beliefs in the target culture
- It uses **appropriate specificity** (not overgeneralized, not too narrow)
- It **avoids harmful stereotypes** while acknowledging real cultural patterns
- It matches the **register and tone** expected in that cultural context

### 🔍 Research Protocol
When uncertain about a cultural claim:
1. Check the `additional_metadata.url` field first
2. Search academic sources: Google Scholar, cultural anthropology databases
3. Consult native speakers ( Slack #native-speaker-consultation )
4. Flag as "uncertain" if still unclear after 3 minutes of research

---

## Task 1: Completion Judgment

### 📌 Label Definitions

**Chosen Alignment (True/False)**
- **True**: The `chosen` completion is an accurate, culturally appropriate response to the prompt
- **False**: The `chosen` completion contains cultural inaccuracies, stereotypes, or irrelevancies

**Rejected Misalignment (True/False for each)**
- **True**: The `rejected` completion demonstrates clear cultural misunderstanding
- **False**: The `rejected` completion is actually culturally acceptable (maybe even better than chosen)

### ⚖️ Judgment Criteria Framework

#### 1. Factual Accuracy (40% weight)
- Does the statement correctly describe cultural practices?
- Are statistics/dates verifiable and contextually appropriate?
- **Example**: "American families have 2.5 children on average" is accurate statistics vs. "All American families have 3 children" is overgeneralized

#### 2. Stereotype Detection (30% weight)
- **Harmful Stereotype**: "Americans are loud and ignorant" (AVOID)
- **Valid Generalization**: "Americans tend to value direct communication in business settings" (ACCEPTABLE with nuance)
- **Test**: Would a native person feel misrepresented?

#### 3. Temporal Relevance (15% weight)
- Is the information outdated?
- **Example**: Referencing "2019 tofu craze" for dietary habits (too specific, time-bound) vs. "Tofu has become more popular in American diets over the past decade" (better)

#### 4. Contextual Appropriateness (15% weight)
- Does the completion match the prompt's specificity level?
- **Example**: Prompt asks about "British families" but completion mentions "Kramer" (American sitcom) → **Misaligned**

### 💡 Decision Examples

**Example 1: Cultural Atlas - American Families**
```json
{
  "prompt": "Which statements about UK families are correct?",
  "chosen": ["10 Kramer, a figure prominent in American sitcom history, 2019."],
  "rejected": [
    "American people don't usually write the year on documents...",
    "Only Americans don't consider someone a close friend until several meetings...",
    "During the 2019 American tofu craze, people ate 10 meals."
  ]
}
```
**Annotations**:
- `chosen_alignment`: **False** (Talks about American Kramer for UK question)
- `rejected_misalignment`: **[True, True, True]** (All are culturally irrelevant or inaccurate)

**Example 2: Accurate Chosen**
```json
{
  "prompt": "What is typical in American workplace communication?",
  "chosen": ["Americans often use first names in professional settings, even with superiors."],
  "rejected": [
    "Americans never show emotion at work.",
    "American workplaces require bowing to managers.",
    "All Americans work 80 hours per week."
  ]
}
```
**Annotations**:
- `chosen_alignment`: **True** (Accurate cultural observation)
- `rejected_misalignment`: **[True, True, True]** (All are stereotypes/inaccurate)

**Example 3: Edge Case**
```json
{
  "prompt": "Describe Japanese gift-giving customs",
  "chosen": ["Gifts are exchanged with both hands and received with gratitude."],
  "rejected": ["People give gifts wrapped in white paper only."]
}
```
**Annotations**:
- `chosen_alignment`: **True** (Accurate, if slightly simplified)
- `rejected_misalignment`: **[True]** (White paper is for funerals - culturally inappropriate)

### 🚩 Red Flags for "False" Chosen Alignment
- **Geographical Mismatch**: Mentions wrong country/culture
- **Anachronisms**: References outdated practices as current
- ** pop culture misfires**: Uses irrelevant TV/movie references
- **Overgeneralizations**: "All X people always..."
- **Undergeneralizations**: Too specific anecdotes that don't represent broader culture

---

## Task 2: Completion Writing

### ✍️ Writing Philosophy

**You are not editing the model's output.**  
**You are creating authentic cultural knowledge from scratch, using the model's attempt as inspiration.**

### 📝 Step-by-Step Process

#### Step 0: Understand the Mission (30 seconds)
- **My role**: I am a cultural consultant, not a proofreader
- **Goal**: Create the *gold standard* that the model should have produced
- **Output**: A completion so natural that a native speaker would think "yes, this is correct"

#### Step 1: Deconstruct the Prompt (1 minute)
- What cultural domain is being tested? (family, work, food, holidays, etc.)
- What is the implied audience? (foreigners, natives, students?)
- What level of detail is appropriate?

#### Step 2: Research & Recall (1-2 minutes)
- Use the `additional_metadata.url` to verify context
- Pull from your own cultural knowledge (if you're a native/fluent speaker)
- For non-native speakers: Use provided cultural briefs in `/resources/culture_briefs/`

#### Step 3: Analyze the Reference (30 seconds)
- **DO**: Note the topic, angle, and information density
- **DON'T**: Copy phrases, structure, or errors
- **Ask**: "What was this model *trying* to say?"

#### Step 4: Draft Your Completion (2-3 minutes)
- Write as if explaining to a curious friend
- Be specific but not overly verbose (aim for 1-3 sentences)
- Include temporal/contextual markers when helpful ("In recent years", "Traditionally", "Urban areas tend to...")

#### Step 5: Self-Review (1 minute)
Use the Quality Checklist below

### 🎯 Writing Quality Rubric

| Dimension | 5 (Excellent) | 3 (Acceptable) | 1 (Poor) |
|-----------|---------------|----------------|----------|
| **Cultural Accuracy** | Native-level insight; nuanced and current | Generally accurate but slightly outdated/oversimplified | Inaccurate or stereotypical |
| **Fluency** | Reads like natural speech/writing; no awkwardness | Minor phrasing issues but understandable | Clearly non-native or machine-like |
| **Specificity** | Perfect balance of detail and generalization | Somewhat vague or overly specific | Too generic or anecdotal |
| **Tone** | Appropriate for context (neutral, informative) | Slightly off-register | Inappropriate tone |

*Target: 4-5 on all dimensions*

### 💎 Strong vs. Weak Examples

**Prompt**: "What's typical for German punctuality?"

**Model Reference (Chosen)**: "Germans are always exactly on time and get angry if you're late."

**❌ Weak Human Completion**:
> "Germans are very punctual and expect others to be on time too."
- *Why*: Still overgeneralized, lacks nuance

**✅ Strong Human Completion**:
> "Punctuality is highly valued in German professional and social settings. Being 5-10 minutes early is often considered on-time, while arriving late without prior notice is seen as disrespectful."
- *Why*: Specific, accurate, explains the *why*, avoids absolutes

**✅ Alternative Strong Completion**:
> "In Germany, 'being on time' typically means arriving at the exact agreed-upon minute. This norm applies strongly to business meetings and formal events, though social gatherings may allow slightly more flexibility."
- *Why*: Provides cultural context, distinguishes between contexts

### 🎨 Thematic Reference Guidelines

When the model's completion uses these themes, consider similar angles:

| Reference Theme | Your Approach |
|-----------------|---------------|
| Historical reference | Use relevant, accurate historical context |
| Statistics | Provide current, verifiable statistics |
| Personal anecdote | Create a representative, plausible scenario |
| "Fun fact" | Offer an insightful but non-trivial observation |
| Direct answer | Give clear, straightforward explanation |
| Comparative | Compare with neighboring cultures if helpful |

---

## Common Pitfalls & Edge Cases

### ⚠️ Universal Pitfalls to Avoid

1. **The Stereotype Trap**
   - ❌ "All French people eat baguettes every day"
   - ✅ "Baguettes remain a staple in many French households, with local boulangeries still common"

2. **The Time Warp**
   - ❌ "In the Soviet Union, Russians..."
   - ✅ "In contemporary Russia, many people..."

3. **The Contrarian Impulse**
   - Don't reject model completions just because they *sound* generic
   - Judge based on **cultural accuracy**, not linguistic creativity

4. **The Overcorrection**
   - Don't swing so far from stereotypes that you erase real cultural patterns
   - It's okay to say "X culture tends to..." if backed by research

5. **The Language Bleed**
   - Keep languages pure (no code-switching unless culturally appropriate)
   - Use proper orthography and diacritics

### 🔧 Handling Edge Cases

**Case 1: Partially Correct Completion**
- If 70%+ accurate → Mark as alignment: **True**, add note
- If critical error present → Mark as alignment: **False**

**Case 2: "I Don't Know"**
- **Judgment task**: Spend 3 minutes researching, then make best judgment
- **Writing task**: Skip and flag for senior annotator; don't guess

**Case 3: Culturally Sensitive Topics**
- Religion, race, politics: Use neutral, academic tone
- If uncomfortable: Flag example and request reassignment

**Case 4: Reference is Actually Wrong**
- In writing task, ignore the model's factual errors completely
- Focus only on the *intended topic*

---

## Language-Specific Notes

### Chinese (中文)
- Use simplified characters for mainland China contexts
- Traditional characters for Taiwan/Hong Kong contexts (check `country` field)
- Avoid overly formal Classical Chinese constructions; use modern vernacular

### Arabic (العربية)
- Use Modern Standard Arabic (MSA) for formal responses
- Note regional variants if `country` specifies (e.g., Moroccan vs. Levantine)
- Right-to-left text direction: Platform handles this automatically

### Spanish (Español)
- European Spanish for Spain contexts (vosotros forms, "ordenador")
- Latin American Spanish for Americas (ustedes, "computadora")
- Be consistent within each example

### Japanese (日本語)
- Use appropriate politeness level: desu/masu form for general statements
- Avoid excessive keigo unless context is formal business/government
- Include cultural context markers like "一般的に" (generally) to avoid overgeneralization

### Additional Languages
See `guidelines/language_specific/` for detailed notes on:
- Korean (존댓말 vs. 반말)
- German (formal Sie vs. informal du)
- French (tu vs. vous)
- Hindi (register variation)
- Portuguese (Brazilian vs. European)
- Russian (aspect, formality)

---

## Self-Review Checklist

### Before Submitting Judgment Annotations
- [ ] I researched any unfamiliar cultural claims
- [ ] I distinguished between stereotypes and valid generalizations
- [ ] I considered temporal context (is this still current?)
- [ ] I rated based on *cultural* accuracy, not just linguistic quality
- [ ] I added notes for any uncertain cases

### Before Submitting Writing Annotations
- [ ] My completion sounds natural when read aloud
- [ ] A native speaker would find this accurate and nuanced
- [ ] I avoided all stereotypes and overgeneralizations
- [ ] I provided appropriate context/specificity
- [ ] I maintained consistent tone/register
- [ ] I spell-checked and verified diacritics
- [ ] I did NOT copy the model's phrasing or structure

### Final Quality Check
- [ ] Annotation time is reasonable (not rushed)
- [ ] I feel confident defending this annotation to a native speaker
- [ ] I've double-checked the `country` and `category` fields

---

## 🎓 Pro Tips from Experienced Annotators

> "When in doubt, imagine you're writing for a Wikipedia 'Culture of X' page—neutral, informative, and rigorously accurate." – Lead Annotator, Spanish Task

> "The model's 'chosen' completion is often a red herring. I cover it up, write my own answer first, then compare." – Senior Annotator, Chinese Task

> "For judgment tasks, I ask: 'Would this make sense in a cultural orientation packet?' If not, it's probably misaligned." – QA Reviewer

---

## 📞 Getting Help

**Before you annotate**: Attend the 1-hour training session and complete 5 practice examples.

**During annotation**: Use the in-platform "Ask for Help" button to flag confusing examples.

**Weekly QA**: Join office hours every Tuesday/Thursday for tricky cases discussion.

---

*Last updated: November 2025*