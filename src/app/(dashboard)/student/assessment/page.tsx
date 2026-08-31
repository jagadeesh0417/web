"use client";

import { useEffect, useState } from "react";
import { ClipboardCheck, AlertTriangle, CheckCircle2, XCircle, RotateCcw, ArrowRight, PartyPopper, Download, ExternalLink } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSession } from "@/lib/auth";
import {
  ASSESSMENT_RULES, getAssessmentEligibility, getAssessmentAttempts, submitAssessment, getEnrollmentByUser,
} from "@/lib/data/repository";
import { demoData } from "@/lib/data/sample-data";
import { cn } from "@/lib/utils";
import type { AppUser, AssessmentQuestion } from "@/lib/types";

const TIMER_SECONDS = 30 * 60;

export default function AssessmentPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [certificateData, setCertificateData] = useState<{ certificateId: string; id: string } | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);

  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => {
      const left = TIMER_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, left));
      if (left <= 0) {
        clearInterval(t);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt]);

  if (!ready || !user) return <DashboardShell><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand-500" /></DashboardShell>;

  const eligibility = getAssessmentEligibility(user.id);
  const attempts = getAssessmentAttempts(user.id);
  const passedAttempt = attempts.find((a) => a.passed);
  const failedCount = attempts.filter((a) => !a.passed).length;

  const start = () => {
    const bank = [...demoData.assessmentQuestions];
    const picked = bank.sort(() => Math.random() - 0.5).slice(0, ASSESSMENT_RULES.questionsPerAttempt);
    setQuestions(picked);
    setAnswers({});
    setSecondsLeft(TIMER_SECONDS);
    setStartedAt(Date.now());
  };

  const handleSubmit = async () => {
    if (!user || !startedAt) return;
    const enrollment = getEnrollmentByUser(user.id);
    if (!enrollment) return;
    setSubmitting(true);
    submitAssessment(
      user.id,
      enrollment,
      questions.map((q) => ({ id: q.id, answer: answers[q.id] ?? -1 })),
    );
    setStartedAt(null);
    setQuestions([]);
    setSubmitting(false);

    const latestAttempts = getAssessmentAttempts(user.id);
    const passed = latestAttempts.find((a) => a.passed);
    if (passed) {
      setGeneratingCert(true);
      setCertError(null);
      try {
        const res = await fetch("/api/internships/certificate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to generate certificate");
        }
        const data = await res.json();
        setCertificateData(data);
      } catch (err: unknown) {
        setCertError(err instanceof Error ? err.message : "Failed to generate certificate");
      } finally {
        setGeneratingCert(false);
      }
    }
  };

  const answered = Object.keys(answers).length;

  const mm = Math.floor(secondsLeft / 60);
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <DashboardShell>
      <PageHeader
        title="Final Assessment"
        description={`${ASSESSMENT_RULES.questionsPerAttempt} questions · pass ${ASSESSMENT_RULES.passPercent}% · ${ASSESSMENT_RULES.maxAttempts} attempts`}
      />

      {!eligibility.eligible && !passedAttempt && !startedAt && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Assessment locked</h3>
                <p className="mt-1 text-sm text-muted-foreground">Complete these requirements before you can take the final assessment:</p>
                <ul className="mt-3 space-y-1.5">
                  {eligibility.reasons.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {generatingCert && (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
            <h2 className="mt-4 text-xl font-bold">Generating certificate...</h2>
            <p className="mt-1 text-sm text-muted-foreground">Please wait while we create your certificate.</p>
          </CardContent>
        </Card>
      )}

      {passedAttempt && !generatingCert && (
        <Card>
          <CardContent className="flex flex-col items-center p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <PartyPopper className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Congratulations!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You scored <strong className="text-foreground">{passedAttempt.score}/{passedAttempt.total}</strong> ({Math.round((passedAttempt.score / passedAttempt.total) * 100)}%)
            </p>

            <div className="mt-5 space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Result: <span className="font-semibold">Passed</span> ✓
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Internship: <span className="font-semibold">Completed</span> ✓
              </div>
              {certificateData ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Certificate: <span className="font-semibold">Generated</span> ✓
                </div>
              ) : certError ? (
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <XCircle className="h-4 w-4" /> Certificate: <span className="font-semibold">Error — {certError}</span>
                </div>
              ) : null}
            </div>

            {certificateData && (
              <p className="mt-3 text-xs text-muted-foreground">Certificate ID: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{certificateData.certificateId}</code></p>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a href="/student/certificate">
                <Button variant="gradient"><ArrowRight className="h-4 w-4" /> View Certificate</Button>
              </a>
              <a href="/student/certificate">
                <Button variant="outline"><Download className="h-4 w-4" /> Download Certificate</Button>
              </a>
              {certificateData && (
                <a href={`/verify-certificate?id=${certificateData.certificateId}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><ExternalLink className="h-4 w-4" /> Verify Certificate</Button>
                </a>
              )}
            </div>

            {certError && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => handleSubmit()}>
                Retry certificate generation
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {eligibility.eligible && !startedAt && !passedAttempt && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-500">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Ready to take your final assessment?</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    {ASSESSMENT_RULES.questionsPerAttempt} MCQs pulled at random from the question bank · {TIMER_SECONDS / 60} minute timer ·
                    pass {ASSESSMENT_RULES.passPercent}% to unlock your certificate. You have {ASSESSMENT_RULES.maxAttempts - failedCount} attempt{failedCount ? "" : "s"} left.
                  </p>
                </div>
              </div>
              <Button variant="gradient" onClick={start} className="shrink-0">Start assessment</Button>
            </div>

            {attempts.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attempt history</p>
                {attempts.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-2.5 text-sm">
                    <span className="flex items-center gap-2">
                      {a.passed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      {new Date(a.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="font-medium">{a.score}/{a.total} · {Math.round((a.score / a.total) * 100)}% {a.passed ? "· Passed" : "· Failed"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {startedAt && questions.length > 0 && (
        <div className="space-y-5">
          <div className="sticky top-0 z-10 rounded-xl border border-border bg-background/95 p-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Badge variant={secondsLeft < 60 ? "destructive" : "primary"}>
                  {mm}:{ss} left
                </Badge>
                <span className="text-sm text-muted-foreground">{answered}/{questions.length} answered</span>
              </div>
              <Button size="sm" variant="gradient" onClick={handleSubmit} loading={submitting} disabled={answered < questions.length}>
                Submit assessment
              </Button>
            </div>
            <Progress value={(answered / questions.length) * 100} className="mt-3" />
          </div>

          {questions.map((q, qi) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">
                  <span className="mr-2 text-muted-foreground">{qi + 1}.</span>{q.question}
                </p>
                <div className="mt-3 grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers((s) => ({ ...s, [q.id]: oi }))}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                          selected ? "border-brand-500 bg-brand-600/5 font-medium text-brand-500" : "border-border hover:border-brand-500/40",
                        )}
                      >
                        <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold", selected ? "border-brand-500 bg-brand-500 text-white" : "border-muted-foreground/40 text-muted-foreground")}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!eligibility.eligible && failedCount >= ASSESSMENT_RULES.maxAttempts && !passedAttempt && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <RotateCcw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Attempts exhausted</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You&apos;ve used all {ASSESSMENT_RULES.maxAttempts} attempts. Contact support (hello@akradhii.com) to request a manual re-evaluation or reset.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
