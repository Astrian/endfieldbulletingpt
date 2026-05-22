CREATE TABLE IF NOT EXISTS "bulletins" (
	"id" integer,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "events" (
	"id" varchar,
	"name" varchar,
	"start_time" integer,
	"end_time" integer,
	"detail" text,
	PRIMARY KEY ("id")
);
