# Lead storage deployment

New submissions use the `websiteLeads` collection in the `akradhii` MongoDB database. Configure `MONGODB_URI` and verify connectivity and backups before deployment. Without a working database the form returns an error and directs visitors to alternative channels. This is intentional: it must not claim a lead was saved to temporary storage.

Before switching, securely back up every existing `data/leads.json` and any recoverable instance-local temporary lead files. Run `node --env-file=.env.local scripts/migrate-file-leads.mjs path/to/leads.json` for each backup against the destination database, then verify the imported records in the admin interface. The script does not delete source files and is repeatable for the same lead IDs. Handle backups as personal data. Do not expose them publicly. Leads that existed only in terminated serverless instances cannot be recovered by this script.

This change does not implement email delivery, a durable retry worker, distributed rate limiting, or a customer confirmation email. WhatsApp remains best effort; a stored `pending`, `failed` or `skipped` status needs operational follow-up. Existing files will not appear in the admin listing until imported. Plan rollback and migrate any new MongoDB leads back before reverting to the legacy file store.
