# Cultural Alignment Annotation Platform

Welcome to the Cultural Alignment Annotation Platform! This repository contains resources for evaluating and improving language model outputs across ten languages, focusing on cultural commonsense understanding.

## 📁 Repository Structure

```
├── ANNOTATION_GUIDELINES.md            # Detailed annotation instructions
├── completion_judgment                 # Classification task: Judge cultural alignment
│   ├── Arabic_carb_samples.json        # 100 Arabic examples
│   ├── Chinese_carb_samples.json       # 100 Chinese examples
│   ├── English_carb_samples.json
│   ├── German_carb_samples.json
│   ├── Japanese_carb_samples.json
│   ├── Korean_carb_samples.json
│   ├── Russian_carb_samples.json
│   ├── Spanish_carb_samples.json
│   ├── Thai_carb_samples.json
│   └── Vietnamese_carb_samples.json
├── completion_writing                  # Writing task: Create culturally-aligned completions
│   ├── Arabic_carb_samples.json
│   ├── Chinese_carb_samples.json
│   ├── English_carb_samples.json
│   ├── German_carb_samples.json
│   ├── Japanese_carb_samples.json
│   ├── Korean_carb_samples.json
│   ├── Russian_carb_samples.json
│   ├── Spanish_carb_samples.json
│   ├── Thai_carb_samples.json
│   └── Vietnamese_carb_samples.json
├── filtering_data.py
└── README.md
```

## 🎯 Annotation Tasks

### Task 1: Completion Judgment (分类任务)

**Goal**: Evaluate whether model completions align with human cultural preferences.

For each example, you will provide **four binary judgments**:
- **chosen_alignment**: Does the `chosen` completion correctly reflect the target culture? (True/False)
- **rejected_misalignment_1**: Does the first `rejected` completion show cultural misunderstanding? (True/False)
- **rejected_misalignment_2**: Does the second `rejected` completion show cultural misunderstanding? (True/False)
- **rejected_misalignment_3**: Does the third `rejected` completion show cultural misunderstanding? (True/False)

### Task 2: Completion Writing (撰写任务)

**Goal**: Write culturally-accurate completions that serve as high-quality references.

For each example:
- Review the `prompt` and cultural context (`country`, `category`)
- Use the model's `chosen` completion as a **thematic reference only** (don't copy)
- Write your **own completion** that:
  - Accurately reflects the specified culture
  - Addresses the same topic/angle as the reference
  - Sounds natural to a native speaker
  - Avoids stereotypes and overgeneralizations

## 📊 Data Format

Each JSON file contains 100 examples with this structure:

```json
{
  "id": "cultural_atlas_945",
  "language": "English",
  "country": "American",
  "prompt": "Question about cultural practice",
  "chosen": ["Model's preferred completion"],
  "chosen_model": ["human_to_GPT-4_translation"],
  "rejected": ["Rejected completion 1", "Rejected completion 2", "Rejected completion 3"],
  "rejected_model": ["Mistral-7B", "Llama-3.3", "Qwen2.5"],
  "num_correct": 1,
  "num_rejected": 3,
  "total_completions": 4,
  "source": "cultural_atlas",
  "subset": "cultural_commonsense",
  "additional_metadata": "{\"culture\": \"American\", \"raw_content\": \"...\", \"url\": \"...\", \"category\": \"family\"}",
  "category": "cultural_commonsense"
}
```

Navigate to `http://localhost:8080` and choose:
- **Task Type**: "Judgment" or "Writing"
- **Language**: Select from 10 supported languages

### 4. Annotate & Save
- Work through examples at your own pace
- Auto-save every 30 seconds to `outputs/autosave/`
- Click "Submit Batch" to finalize and save to `outputs/{task}/{language}/`
- Download results as JSON or CSV anytime

## 📈 Output Format

### Judgment Task Output
Saved as `outputs/judgment/{language}/{annotator_id}_{timestamp}.json`:

```json
{
  "example_id": "cultural_atlas_945",
  "annotator_id": "annotator_01",
  "chosen_alignment": false,
  "rejected_misalignment": [true, true, false],
  "confidence": "high",
  "notes": "The chosen completion references Kramer (American sitcom) but the question was about British families",
  "annotation_time_seconds": 45
}
```

### Writing Task Output
Saved as `outputs/writing/{language}/{annotator_id}_{timestamp}.json`:

```json
{
  "example_id": "cultural_atlas_945",
  "annotator_id": "annotator_01",
  "original_prompt": "Put your understanding of British families to the test...",
  "human_completion": "Your culturally-aligned completion here",
  "reference_completion": "sitcom_reference",
  "annotation_time_seconds": 120
}
```

---

*Thank you for helping us build more culturally-aware AI systems! Your careful annotation makes a real difference.*

---
