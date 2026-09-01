import type { Metadata } from "next";
import { EnrollmentSuccessClient } from "./client";

export const metadata: Metadata = {
  title: "Enrollment Successful",
  description: "Your internship enrollment has been confirmed.",
  robots: { index: false },
};

export default function EnrollmentSuccessPage() {
  return <EnrollmentSuccessClient />;
}
