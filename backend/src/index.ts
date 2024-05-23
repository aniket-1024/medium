import { Hono } from 'hono';
import { userRoute } from './routes/user';
import { blogRoute } from './routes/blogs';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string
	}
}>();

app.get("/", (c) => {
  return c.text('hello hono');
})
app.route("/api/v1/user", userRoute);
app.route("/api/v1/blog", blogRoute)


export default app;
