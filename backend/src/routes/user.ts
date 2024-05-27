import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@aniket_2410/medium-common/dist"

export const userRoute = new Hono<{
	Bindings: {
		DATABASE_URL: string,
        JWT_SECRET: string
	}
}>();


userRoute.post('/signup', async (c) => {
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL,
	}).$extends(withAccelerate());

	const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if(!success) {
    c.status(400)
    return c.json({
      msg: "Wrong input",
    })
  }
  console.log(body)
	try {
		const user = await prisma.user.create({
			data: {
				username: body.username,
				password: body.password,
        name: body.name
			}
		});

    const jwt = await sign({id: user.id},c?.env.JWT_SECRET)
    return c.json(jwt)
	} catch(e) {
		return c.json({
      e
    });
	}
})

userRoute.post('/signin',async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c?.env.DATABASE_URL
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  if(!success) {
    c.status(411)
    return c.json({
      msg: "Wrong input",
    })
  }
  console.log(success)
  const user = await prisma.user.findUnique({
    where: {
      username: body.username,
      password: body.password
    }
  });
  if(!user) {
    c.status(403)
    return c.json({ error: "user not found" });
  } 
  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
	return c.json(jwt);

})
