import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  kycStatus: varchar('kyc_status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const kycSubmissions = pgTable('kyc_submissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  panNumber: varchar('pan_number', { length: 10 }).notNull(),
  idProofType: varchar('id_proof_type', { length: 50 }).notNull(),
  idProofNumber: varchar('id_proof_number', { length: 50 }).notNull(),
  panCardImage: text('pan_card_image').notNull(),
  idProofImage: text('id_proof_image').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  submittedAt: timestamp('submitted_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
}); 