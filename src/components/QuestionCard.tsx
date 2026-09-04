import type { Question, RunAnswer } from '../lib/types'
import { LETTERS } from '../lib/format'
import { IconCheck, IconCross, IconFlag, IconStar, Pill } from './ui'

export type CardMode = 'instant' | 'locked' | 'review'

interface Props {
  question: Question
  answer: RunAnswer
  mode: CardMode
  number: number
  total: number
  bookmarked: boolean
  onSelect: (indices: number[]) => void
  onFlag?: () => void
  onBookmark?: () => void
  showExplanation?: boolean
  register?: 'app' | 'exam'
}

function optionState(
  i: number,
  q: Question,
  a: RunAnswer,
  revealed: boolean,
): 'idle' | 'chosen' | 'right' | 'wrong' | 'missed' {
  const chosen = a.selected.includes(i)
  if (!revealed) return chosen ? 'chosen' : 'idle'
  const isRight = q.correct_indices.includes(i)
  if (chosen && isRight) return 'right'
  if (chosen && !isRight) return 'wrong'
  if (!chosen && isRight) return 'missed'
  return 'idle'
}

export function QuestionCard({
  question: q,
  answer,
  mode,
  number,
  total,
  bookmarked,
  onSelect,
  onFlag,
  onBookmark,
  showExplanation = true,
  register = 'app',
}: Props) {
  const revealed = mode === 'review' || (mode === 'instant' && answer.revealed)
  const need = q.correct_indices.length
  const exam = register === 'exam'

  function toggle(i: number) {
    if (revealed) return
    if (need === 1) {
      onSelect([i])
      return
    }
    const has = answer.selected.includes(i)
    if (has) {
      onSelect(answer.selected.filter((x) => x !== i))
    } else if (answer.selected.length < need) {
      onSelect([...answer.selected, i])
    } else {
      // replace the oldest choice so a third click still feels responsive
      onSelect([...answer.selected.slice(1), i])
    }
  }

  const gotItRight = revealed && q.correct_indices.every((i) => answer.selected.includes(i)) &&
    answer.selected.length === need

  return (
    <article
      className={
        exam
          ? 'bg-[var(--exam-body)] border border-[var(--exam-line)] rounded-[2px]'
          : 'bg-[var(--surface)] border border-[var(--line)] rounded-[3px]'
      }
    >
      <header
        className={`flex items-start justify-between gap-6 px-6 pt-5 pb-4 border-b ${
          exam ? 'border-[var(--exam-line)]' : 'border-[var(--line)]'
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="eyebrow tnum">
              Question {number} of {total}
            </span>
            {need > 1 ? <Pill tone="warn">Choose {need} answers</Pill> : null}
            {!exam && q.topic ? <Pill>{q.topic}</Pill> : null}
          </div>
          <h1
            className={
              exam
                ? 'text-[19px] leading-[1.45] font-semibold text-[var(--exam-ink)] max-w-[62ch]'
                : 'font-display text-[22px] leading-[1.35] text-[var(--ink)] max-w-[58ch]'
            }
          >
            {q.question}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onBookmark ? (
            <button
              type="button"
              onClick={onBookmark}
              aria-pressed={bookmarked}
              title={bookmarked ? 'Remove from Weak Spots (Shift+B)' : 'Save to Weak Spots (Shift+B)'}
              className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-[12px] font-medium transition-colors ${
                bookmarked
                  ? 'border-[var(--warn-line)] bg-[var(--warn-wash)] text-[var(--warn)]'
                  : 'border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <IconStar filled={bookmarked} size={14} />
              {bookmarked ? 'Saved' : 'Save'}
            </button>
          ) : null}
          {onFlag ? (
            <button
              type="button"
              onClick={onFlag}
              aria-pressed={answer.flagged}
              title="Flag for review (F)"
              className={`inline-flex items-center gap-1.5 rounded-[2px] border px-2 py-1 text-[12px] font-medium transition-colors ${
                answer.flagged
                  ? 'border-[var(--warn-line)] bg-[var(--warn-wash)] text-[var(--warn)]'
                  : 'border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <IconFlag filled={answer.flagged} size={14} />
              {answer.flagged ? 'Flagged' : 'Flag'}
            </button>
          ) : null}
        </div>
      </header>

      <ul className="flex flex-col gap-2 px-6 py-5" role="group" aria-label="Answer options">
        {q.options.map((opt, i) => {
          const state = optionState(i, q, answer, revealed)
          const base =
            'w-full text-left flex items-stretch gap-0 rounded-[2px] border transition-colors duration-100 overflow-hidden'
          const tone = {
            idle: `border-[var(--line)] bg-[var(--surface)] ${
              revealed ? '' : 'hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]'
            }`,
            chosen: 'border-[var(--accent)] bg-[var(--accent-wash)]',
            right: 'border-[var(--good-line)] bg-[var(--good-wash)]',
            wrong: 'border-[var(--bad-line)] bg-[var(--bad-wash)]',
            missed: 'border-[var(--good-line)] bg-[var(--surface)]',
          }[state]

          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                disabled={revealed}
                aria-pressed={answer.selected.includes(i)}
                className={`${base} ${tone} ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                {/* status rail: solid = correct, hatched = incorrect */}
                <span
                  aria-hidden="true"
                  className={`w-[4px] shrink-0 ${
                    state === 'right'
                      ? 'bg-[var(--good)]'
                      : state === 'wrong'
                        ? 'hatch-bad'
                        : state === 'missed'
                          ? 'bg-[var(--good-line)]'
                          : state === 'chosen'
                            ? 'bg-[var(--accent)]'
                            : 'bg-transparent'
                  }`}
                />
                <span className="flex items-start gap-3 px-3.5 py-3 flex-1">
                  <span
                    className={`mt-[1px] shrink-0 w-[22px] h-[22px] rounded-[2px] border font-mono text-[11.5px] font-semibold inline-flex items-center justify-center ${
                      state === 'right'
                        ? 'border-[var(--good)] text-[var(--good)]'
                        : state === 'wrong'
                          ? 'border-[var(--bad)] text-[var(--bad)]'
                          : state === 'chosen'
                            ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]'
                            : 'border-[var(--line-strong)] text-[var(--muted)]'
                    }`}
                  >
                    {LETTERS[i]}
                  </span>
                  <span
                    className={`text-[14.5px] leading-[1.5] ${
                      state === 'right'
                        ? 'text-[var(--good)] font-medium'
                        : state === 'wrong'
                          ? 'text-[var(--bad)]'
                          : 'text-[var(--ink)]'
                    }`}
                  >
                    {opt}
                  </span>
                  {revealed && state !== 'idle' ? (
                    <span
                      className={`ml-auto shrink-0 inline-flex items-center gap-1.5 text-[11.5px] font-semibold whitespace-nowrap ${
                        state === 'right' || state === 'missed'
                          ? 'text-[var(--good)]'
                          : 'text-[var(--bad)]'
                      }`}
                    >
                      {state === 'right' ? (
                        <>
                          <IconCheck size={14} /> Correct
                        </>
                      ) : state === 'wrong' ? (
                        <>
                          <IconCross size={14} /> Your answer
                        </>
                      ) : (
                        <>
                          <IconCheck size={14} /> Correct answer
                        </>
                      )}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      {revealed && showExplanation ? (
        <div
          className={`rise mx-6 mb-5 rounded-[2px] border px-4 py-3.5 ${
            gotItRight
              ? 'border-[var(--good-line)] bg-[var(--good-wash)]'
              : 'border-[var(--bad-line)] bg-[var(--bad-wash)]'
          }`}
        >
          <div
            className={`flex items-center gap-2 text-[12.5px] font-bold tracking-[0.02em] uppercase ${
              gotItRight ? 'text-[var(--good)]' : 'text-[var(--bad)]'
            }`}
          >
            {gotItRight ? <IconCheck size={15} /> : <IconCross size={15} />}
            {gotItRight ? 'Correct' : 'Not quite'}
          </div>
          <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[var(--ink-2)] max-w-[70ch]">
            {q.explanation}
          </p>

        </div>
      ) : null}
    </article>
  )
}
