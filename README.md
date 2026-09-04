# Life in the UK Trainer

A practice web application for the **Life in the UK** citizenship test. Featuring 408 questions across 17 practice tests, an adaptive learning engine that prioritises questions you get wrong, and a timed simulation mirroring the real exam.

**Live Demo (GitHub Pages):** [https://eddiesung111.github.io/life-in-the-uk-trainer/](https://eddiesung111.github.io/life-in-the-uk-trainer/)

[繁體中文版 README](README_ZH.md)

Nothing to install and nothing to download. Simply open the link and start practicing.

This repository publishes itself to GitHub Pages, serving the app directly from `https://eddiesung111.github.io/life-in-the-uk-trainer/`.

---

## What it is

Built for anyone preparing to sit the Life in the UK test. The full bank of 408 questions is grouped into the 17 practice tests they originate from, with every question accompanied by a concise note explaining the answer. 

The interface is presented in Traditional Chinese, while the questions, options, and test controls remain in English to match the format of the official exam.

- **408 questions** across **17 practice tests** (24 questions per test)
- Single-answer, true/false, and "choose two answers" question formats identical to the real test
- Explanatory notes provided for every question
- Star questions directly into a custom **Weak Spots** deck
- In-depth **Statistics**: overall mastery rate, 408-question failure heatmap, per-chapter and per-test accuracy, score trends, and a sortable question performance table

---

## How to use it

1. Open [https://eddiesung111.github.io/life-in-the-uk-trainer/](https://eddiesung111.github.io/life-in-the-uk-trainer/) on a computer.
2. Start with **Practice tests** and progress sequentially through tests 1 to 17.
3. Select an answer, then click **Submit answer**. Answers are not graded until submitted, allowing you to change your choice freely before submitting. Click **Next** to proceed.
4. Switch to **Adaptive mock** after covering initial tests — it dynamically selects 24 questions weighted towards those you frequently answer incorrectly.
5. Use **Official simulation** to rehearse under realistic conditions: 24 questions, 45-minute countdown, no answer feedback until final submission, and a pass mark of 18/24 (75%).
6. Check **Statistics** to identify chapters requiring further revision.

### Keyboard Shortcuts
- `1`–`4` or `A`–`D`: Select answer options
- `Enter`: Submit answer / proceed to next question
- `←` / `→`: Navigate between questions
- `F`: Flag question for review (during exam)
- `Shift` + `B`: Bookmark / save question to Weak Spots

---

## Modes

| Mode | Description |
|---|---|
| **Practice tests** | 17 structured tests with 24 questions each. Evaluated on submission with detailed explanations. Untimed with free back-and-forth navigation. |
| **Adaptive mock** | 24 questions dynamically selected from all 408 questions based on historical performance. Instant feedback per question with a final summary score. |
| **Official simulation** | Mirrors official test conditions: 24 questions, 45-minute countdown with low-time alert, flag-for-review navigation grid, locked answers until submission, and pass/fail evaluation (18/24) with full review mode. |
| **Weak spots** | Custom deck containing starred questions and any questions with <60% accuracy or incorrect on the last attempt. Drill the combined deck or specific sub-sets. |
| **Statistics** | Comprehensive dashboard showing overall 408-question mastery rate, failure heatmap, accuracy broken down by handbook chapter and test, score trend graph, and a sortable question table. |

> **Definition of Mastered:** A question is classified as **mastered** once it has been answered at least twice and answered correctly on its two most recent attempts.

---

## Adaptive Sampling Algorithm

Each question is assigned a selection weight based on a Cauchy (Lorentzian) probability density function calculated from the user's accuracy rate ($r_i$):

$$P(q_i) \propto \frac{1}{\gamma \cdot \left(1 + \left(\frac{r_i - x_0}{\gamma}\right)^2\right)}$$

where $\gamma = 0.35$ and $x_0 = 0$. The probability density peaks at a 0% accuracy rate and decays with a heavy tail. Consequently, a question you have never answered correctly is roughly **nine times** more likely to be drawn than one you consistently answer correctly, while mastered questions maintain a small, non-zero probability of reappearing.

The accuracy rate $r_i$ is Laplace-smoothed as:

$$r_i = \frac{\text{correct} + 1.5 \times 0.55}{\text{attempts} + 1.5}$$

This ensures unseen questions start with a prior probability of 0.55. Four additional weighting multipliers are applied:

| Factor | Effect |
|---|---|
| **Recency** | Up to $\times 1.6$ multiplier when the last 3 consecutive attempts were incorrect |
| **Cooldown** | $\times 0.35$ temporary reduction, gradually returning to $\times 1.0$ over 1 hour |
| **Bookmark** | $\times 1.5$ multiplier for questions saved to Weak Spots |
| **Dedupe** | Duplicate question wording collapses within a single run |

Weighted random sampling without replacement is implemented using the **Efraimidis–Spirakis method**: each question receives a key value calculated as $-\ln(U) / w$, where $U \sim \text{Uniform}(0, 1)$ and $w$ is the final weight. The 24 questions with the smallest keys are selected.

---

## Data Persistence & Requirements

> **Data Storage:** Your progress and statistics are stored locally in your browser (`localStorage` / `IndexedDB`). Progress is tied to the specific browser and device used. Using a different browser, incognito/private mode, or clearing browsing data will reset statistics. No user account is required and no data is sent to an external server.

> **Desktop / Laptop Optimized:** The official exam is taken on a desktop computer. This app is designed for screens with a minimum width of $1024\text{px}$.

---

## Credit

Built with [Claude](https://claude.ai) by Anthropic — question bank extraction, explanations, Traditional Chinese translation, adaptive engine, UI design, and test suite were developed using Claude.

---

## License

[MIT License](LICENSE). Free to use, modify, distribute, and share.

*Disclaimer: Not affiliated with the Home Office or GOV.UK. This material is for practice purposes only. Please consult the official handbook for authoritative study material.*