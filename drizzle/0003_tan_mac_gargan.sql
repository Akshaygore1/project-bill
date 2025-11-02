CREATE TABLE "customer_service_prices" (
	"id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"service_id" text NOT NULL,
	"custom_price" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "payment_due_date" integer;--> statement-breakpoint
ALTER TABLE "customer_service_prices" ADD CONSTRAINT "customer_service_prices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_prices" ADD CONSTRAINT "customer_service_prices_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;