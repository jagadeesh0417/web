import type { Metadata } from "next";
import { EnrollmentSuccessClient } from "./client";

export const metadata: Metadata = {
  title: "Enrollment Successful | Akradhii",
  description: "Your internship enrollment has been confirmed.",
  robots: { index: false },
};

export default function EnrollmentSuccessPage() {
  return <EnrollmentSuccessClient />;
}
