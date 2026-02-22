import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { db } from "./db";
import { users, calculations } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { sign } from "hono/jwt";

const app = new Hono();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

app.use("*", cors());

// Auth Routes
app.post("/auth/register", async (c) => {
  const { email, password } = await c.req.json();
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning();

    const token = await sign({ userId: user.id }, JWT_SECRET);
    return c.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    return c.json({ error: "User already exists" }, 400);
  }
});

app.post("/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await sign({ userId: user.id }, JWT_SECRET);
  return c.json({ token, user: { id: user.id, email: user.email } });
});

// Protected Calculation Routes
app.use("/api/*", jwt({ secret: JWT_SECRET, alg: "HS256" }));

app.get("/api/calculation", async (c) => {
  const payload = c.get("jwtPayload");
  const [calc] = await db
    .select()
    .from(calculations)
    .where(eq(calculations.userId, payload.userId))
    .limit(1);
  return c.json(calc || {});
});

app.post("/api/calculation", async (c) => {
  const payload = c.get("jwtPayload");
  const body = await c.req.json();

  const existing = await db
    .select()
    .from(calculations)
    .where(eq(calculations.userId, payload.userId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db
      .update(calculations)
      .set({
        numPeople: body.numPeople,
        person1Data: body.person1Data,
        person2Data: body.person2Data,
        childcareData: body.childcareData,
        updatedAt: new Date(),
      })
      .where(eq(calculations.userId, payload.userId))
      .returning();
    return c.json(updated);
  } else {
    const [inserted] = await db
      .insert(calculations)
      .values({
        userId: payload.userId,
        numPeople: body.numPeople,
        person1Data: body.person1Data,
        person2Data: body.person2Data,
        childcareData: body.childcareData,
      })
      .returning();
    return c.json(inserted);
  }
});

export default app;
