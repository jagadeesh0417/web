export type Resource = {
  slug: string; title: string; category: string; difficulty: "Beginner" | "Intermediate";
  type: "Guide" | "Checklist"; summary: string; publishedAt: string;
  sections: { heading: string; paragraphs: string[] }[];
};

// Original editorial content. Dates describe publication of this collection,
// not dates generated at request time.
export const resources: Resource[] = [
  { slug: "web-fundamentals", title: "A practical roadmap to web development", category: "Development", difficulty: "Beginner", type: "Guide", summary: "Build a solid foundation in HTML, CSS, JavaScript and the tools used to ship a website.", publishedAt: "2026-11-09", sections: [
    { heading: "Start with the browser", paragraphs: ["HTML describes the structure of a page. Use meaningful elements such as headings, navigation and forms before adding visual styling. Check that the page remains understandable with CSS disabled.", "CSS controls presentation. Learn the box model, Flexbox and Grid, then test layouts at narrow and wide viewport widths. Use relative units and avoid fixed widths that force horizontal scrolling."] },
    { heading: "Add interaction", paragraphs: ["JavaScript responds to events and updates the page. Practice with a small accessible tab interface, validating a form and fetching data from a public API. Handle loading, empty and error states explicitly.", "Use Git to record changes and GitHub to share your work. Once you understand these fundamentals, explore React components and Next.js routing. Deploy a small project and check its accessibility, performance and mobile layout."] },
  ] },
  { slug: "automation-first-workflow", title: "Plan your first automation workflow", category: "AI & Automation", difficulty: "Beginner", type: "Guide", summary: "Map a repetitive process, identify safe automation opportunities and test before rollout.", publishedAt: "2026-11-09", sections: [
    { heading: "Map the process", paragraphs: ["Choose a repeatable task with a clear trigger and outcome, such as routing an enquiry to the right team. Write down the inputs, decisions, handoffs and exceptions before choosing a tool.", "Determine which steps need human approval. Avoid sending sensitive information to an AI service without understanding its data handling and your organisation’s policies."] },
    { heading: "Build and measure", paragraphs: ["Create a small workflow with a test account. Validate inputs, record failures and make retries safe so duplicate events do not create duplicate actions.", "Compare the time and error rate before and after rollout. Review outputs regularly; an AI-generated answer should be checked where accuracy or safety matters."] },
  ] },
  { slug: "marketing-measurement-basics", title: "A better starting point for marketing measurement", category: "Digital Marketing", difficulty: "Beginner", type: "Guide", summary: "Connect campaign goals to useful metrics instead of reporting clicks in isolation.", publishedAt: "2026-11-09", sections: [
    { heading: "Define the outcome", paragraphs: ["Start with a business goal: qualified enquiries, purchases or another measurable action. Define what counts as a conversion and make sure the team agrees on that definition.", "Map the journey from discovery to conversion. Search visibility, ad clicks and landing-page engagement can help explain performance, but they are not substitutes for the outcome itself."] },
    { heading: "Make a measurement plan", paragraphs: ["Document events, campaign naming conventions and the reporting period. Test tracking in a controlled session and respect applicable consent and privacy requirements.", "Compare conversion rate and acquisition cost alongside lead quality and margin. Change one meaningful variable at a time, record the result and avoid drawing conclusions from a tiny sample."] },
  ] },
  { slug: "accessible-interface-basics", title: "Designing interfaces people can use", category: "Design", difficulty: "Beginner", type: "Guide", summary: "A practical introduction to hierarchy, responsive layouts and accessibility.", publishedAt: "2026-11-09", sections: [
    { heading: "Make the hierarchy clear", paragraphs: ["Start with the user's task. Give each screen a clear heading and make the primary action easy to find. Use spacing and typography consistently rather than relying on decoration.", "Create reusable design tokens for type, spacing and colour. Check text contrast and do not communicate status through colour alone."] },
    { heading: "Test the experience", paragraphs: ["Sketch small-screen layouts first, then adapt to wider screens. Test long labels, errors and empty states, not only ideal content.", "Walk through the interface with a keyboard. Ensure focus is visible, controls have descriptive labels and touch targets are comfortable. Ask users to complete a task and observe where they get stuck."] },
  ] },
  { slug: "career-project-case-study", title: "Turn a learning project into a useful case study", category: "Career & Internship Preparation", difficulty: "Beginner", type: "Guide", summary: "Explain your decisions, demonstrate your contribution and present your work honestly.", publishedAt: "2026-11-09", sections: [
    { heading: "Tell the story", paragraphs: ["Describe the problem, the intended audience and your role. If the work is a personal exercise or concept, label it clearly rather than implying a client commissioned it.", "Show the constraints and alternatives you considered. Explain a few specific decisions and connect them to the needs of the people using the product."] },
    { heading: "Show evidence", paragraphs: ["Link to a working demo or repository when available, and include screenshots you have permission to share. Describe how someone can run the project and what you would improve next.", "Report outcomes only when you can substantiate them. A thoughtful explanation of what you learned is more useful than an invented performance metric."] },
  ] },
  { slug: "website-launch-checklist", title: "Website launch checklist", category: "Business Resources", difficulty: "Beginner", type: "Checklist", summary: "A concise pre-launch review for content, accessibility, security and measurement.", publishedAt: "2026-11-09", sections: [
    { heading: "Content and experience", paragraphs: ["Confirm ownership and approval of copy, images and client references. Check contact details, links, page titles and descriptions. Test key journeys on a phone, tablet and desktop.", "Check keyboard navigation, form labels, focus indicators and colour contrast. Provide useful error messages and confirm forms reach the intended recipient."] },
    { heading: "Operations and measurement", paragraphs: ["Confirm domain, HTTPS, backups, access permissions and a rollback plan. Keep secrets out of source control and review third-party integrations.", "Test analytics and conversion events with appropriate consent. Submit the sitemap to your search tools, monitor errors after launch and assign an owner for ongoing updates."] },
  ] },
];

export function readingTime(resource: Resource) {
  const words = resource.sections.flatMap((section) => section.paragraphs).join(" ").trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
