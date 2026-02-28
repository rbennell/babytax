import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calculations = pgTable("calculations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  numPeople: integer("num_people").notNull().default(1),
  person1Data: jsonb("person1_data"),
  person2Data: jsonb("person2_data"),
  childcareData: jsonb("childcare_data"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
