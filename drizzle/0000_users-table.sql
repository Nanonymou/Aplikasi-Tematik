CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(30) NOT NULL,
	"class_name" varchar(20) NOT NULL,
	"school_name" varchar(50) NOT NULL,
	"avatar_url" text DEFAULT '⭐' NOT NULL,
	"pin_hash" varchar(64) NOT NULL,
	"total_stars" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "users_name_lower_idx" ON "users" USING btree (lower("name"));