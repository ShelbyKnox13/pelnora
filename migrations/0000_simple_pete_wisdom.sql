CREATE TYPE "public"."earning_type" AS ENUM('direct', 'binary', 'level', 'autopool', 'emi_bonus');--> statement-breakpoint
CREATE TYPE "public"."emi_status" AS ENUM('pending', 'paid', 'late', 'bonus_earned');--> statement-breakpoint
CREATE TYPE "public"."kyc_status" AS ENUM('not_submitted', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."package_type" AS ENUM('silver', 'gold', 'platinum', 'diamond');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('emi_payment', 'earning', 'withdrawal', 'deduction');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."withdrawal_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "auto_pool" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"position" integer NOT NULL,
	"level" integer NOT NULL,
	"parent_id" integer,
	"join_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "binary_structure" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"parent_id" integer,
	"position" text NOT NULL,
	"level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "earnings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"earning_type" "earning_type" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"related_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "emi_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"package_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"payment_date" timestamp DEFAULT now() NOT NULL,
	"status" "emi_status" DEFAULT 'paid' NOT NULL,
	"month" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"package_type" "package_type" NOT NULL,
	"monthly_amount" numeric NOT NULL,
	"total_months" integer DEFAULT 11 NOT NULL,
	"paid_months" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"bonus_earned" boolean DEFAULT false NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"next_payment_due" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"type" "transaction_type" NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"related_id" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"password" text NOT NULL,
	"referral_id" text NOT NULL,
	"referred_by" integer,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"left_team_count" integer DEFAULT 0 NOT NULL,
	"right_team_count" integer DEFAULT 0 NOT NULL,
	"left_carry_forward" numeric DEFAULT '0' NOT NULL,
	"right_carry_forward" numeric DEFAULT '0' NOT NULL,
	"total_earnings" numeric DEFAULT '0' NOT NULL,
	"withdrawable_amount" numeric DEFAULT '0' NOT NULL,
	"bank_name" text,
	"account_number" text,
	"ifsc_code" text,
	"pan_number" text,
	"id_proof_type" text,
	"id_proof_number" text,
	"pan_card_image" text,
	"id_proof_image" text,
	"kyc_status" "kyc_status" DEFAULT 'not_submitted' NOT NULL,
	"kyc_rejection_reason" text,
	"unlocked_levels" integer DEFAULT 0 NOT NULL,
	"auto_pool_eligible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_referral_id_unique" UNIQUE("referral_id")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"amount" numeric NOT NULL,
	"status" "withdrawal_status" DEFAULT 'pending' NOT NULL,
	"request_date" timestamp DEFAULT now() NOT NULL,
	"processed_date" timestamp,
	"remarks" text
);
--> statement-breakpoint
ALTER TABLE "auto_pool" ADD CONSTRAINT "auto_pool_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto_pool" ADD CONSTRAINT "auto_pool_parent_id_auto_pool_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."auto_pool"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "binary_structure" ADD CONSTRAINT "binary_structure_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "binary_structure" ADD CONSTRAINT "binary_structure_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "earnings" ADD CONSTRAINT "earnings_related_user_id_users_id_fk" FOREIGN KEY ("related_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emi_payments" ADD CONSTRAINT "emi_payments_package_id_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emi_payments" ADD CONSTRAINT "emi_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "packages" ADD CONSTRAINT "packages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;