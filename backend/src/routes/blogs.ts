import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRoute = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>();

blogRoute.use('/*', async (c, next) => {
    const header = c.req.header("Authorization")||""
    const token = header.split(' ')
    const response = await verify(token[1], c.env.JWT_SECRET)

    console.log(response.id)
    if(response.id) {
        c.set("userId", response.id)
        await next();
    } 

    c.status(403)
    return c.json({error: "unauthorized"})
  })

blogRoute.post('/', async (c) => {
    const body = await c.req.json();
    const userId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    },).$extends(withAccelerate());

    const blog = await prisma.post.create({
        data:{
            title: body.title,
            content: body.content,
            authorId: Number(userId)
        }
    })

    return c.json({
        id: blog.id
    })
})
blogRoute.put('/', async(c) => {
    const body = await c.req.json();
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    },).$extends(withAccelerate());

    const blog = await prisma.post.update({
        where:{
            id: body.id
        }, 
        data: {
            title: body.title,
            content: body.content
        }
    })

    return c.json({
        id: blog.id
    })
})
blogRoute.get('/bulk', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    },).$extends(withAccelerate());

    const blogs = await prisma.post.findMany();

    return c.json({
        blogs
    })
})
blogRoute.get('/:id', async(c) => {
    const id = await c.req.param("id");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    },).$extends(withAccelerate());

    try {
            const blog = await prisma.post.findUnique({
            where:{
                id: Number(id)
            }
        })
        return c.json({
            blog
        })
    } catch(err) {
        c.status(411)
        return c.json({
            msg: "Error while fetching blog post"
        })        
    }

})