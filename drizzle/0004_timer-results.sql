CREATE TABLE "timer_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"math_type" varchar(12) NOT NULL,
	"correct_answers" integer NOT NULL,
	"wrong_answers" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "timer_results" ADD CONSTRAINT "timer_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "timer_results_user_mode_idx" ON "timer_results" USING btree ("user_id","math_type");