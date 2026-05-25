import { NextResponse } from 'next/server';
import { connectToDB, getProjectConnection, isLocalMongoUri } from '@/lib/db';
import BlogPost, { getBlogPostModel } from '@/models/BlogPost.model';
import Project from '@/models/Project.model';
import { formatBlogPost, getBlogPosts } from '@/lib/posts/server';
import { createPostSchema, deletePostsSchema, updatePostSchema } from '@/lib/validations/post';

function validationError(error: unknown) {
  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : 'The post payload is invalid.',
    },
    { status: 400 }
  );
}

function normalizePostPayload<T extends { publishDate?: string; projectId?: string }>(payload: T) {
  const normalized: Record<string, unknown> = { ...payload };

  if ('publishDate' in payload) {
    normalized.publishDate = payload.publishDate ? new Date(payload.publishDate) : null;
  }

  if ('projectId' in payload) {
    normalized.projectId = payload.projectId || null;
  }

  return normalized;
}

function normalizeProjectId(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function getProjectConfig(projectId: string) {
  await connectToDB();
  return Project.findOne({ id: projectId }).lean<{ id: string; mongodbUri: string } | null>();
}

function localMongoError() {
  return NextResponse.json(
    {
      error:
        'Local MongoDB URIs (localhost/127.0.0.1) are not reachable from the hosted app. Use a publicly reachable MongoDB host or Atlas.',
    },
    { status: 400 }
  );
}

async function getProjectBlogPostModel(projectId: string) {
  const project = await getProjectConfig(projectId);
  if (!project) {
    return { error: NextResponse.json({ error: 'Project not found.' }, { status: 404 }) };
  }

  if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
    return { error: localMongoError() };
  }

  const connection = await getProjectConnection(project.mongodbUri);
  return { model: getBlogPostModel(connection) };
}

export async function GET() {
  try {
    const posts = await getBlogPosts();

    return NextResponse.json({
      message: 'Posts fetched successfully',
      data: posts,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const parsed = createPostSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const normalizedProjectId = normalizeProjectId(parsed.data.projectId);

    if (normalizedProjectId) {
      const projectModel = await getProjectBlogPostModel(normalizedProjectId);
      if (projectModel.error) return projectModel.error;

      const post = await projectModel.model!.create(
        normalizePostPayload({
          ...parsed.data,
          projectId: normalizedProjectId,
          id: parsed.data.id ?? `post-${crypto.randomUUID()}`,
        })
      );

      return NextResponse.json(
        {
          message: 'Post created successfully',
          data: formatBlogPost(post.toObject()),
        },
        { status: 201 }
      );
    }

    await connectToDB();
    const post = await BlogPost.create(
      normalizePostPayload({
        ...parsed.data,
        id: parsed.data.id ?? `post-${crypto.randomUUID()}`,
      })
    );

    return NextResponse.json(
      {
        message: 'Post created successfully',
        data: formatBlogPost(post.toObject()),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const parsed = updatePostSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const normalizedProjectId = normalizeProjectId(parsed.data.updates.projectId);
    const updates = normalizePostPayload(parsed.data.updates);

    if (normalizedProjectId) {
      const projectModel = await getProjectBlogPostModel(normalizedProjectId);
      if (projectModel.error) return projectModel.error;

      const projectUpdate = await projectModel.model!.updateOne(
        { id: parsed.data.id },
        { $set: updates }
      );

      if (projectUpdate.matchedCount === 0) {
        await connectToDB();
        const mainUpdate = await BlogPost.updateOne({ id: parsed.data.id }, { $set: updates });
        if (mainUpdate.matchedCount === 0) {
          return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        const posts = await BlogPost.find({ id: parsed.data.id });
        return NextResponse.json({
          message: 'Post updated successfully',
          data: posts.map((post) => formatBlogPost(post.toObject())),
        });
      }

      const posts = await projectModel.model!.find({ id: parsed.data.id });

      return NextResponse.json({
        message: 'Post updated successfully',
        data: posts.map((post) => formatBlogPost(post.toObject())),
      });
    }

    await connectToDB();
    const mainUpdate = await BlogPost.updateOne({ id: parsed.data.id }, { $set: updates });

    if (mainUpdate.matchedCount > 0) {
      const posts = await BlogPost.find({ id: parsed.data.id });
      return NextResponse.json({
        message: 'Post updated successfully',
        data: posts.map((post) => formatBlogPost(post.toObject())),
      });
    }

    const projects = await Project.find().lean<{ id: string; mongodbUri: string }[]>();
    for (const project of projects) {
      if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
        continue;
      }
      const connection = await getProjectConnection(project.mongodbUri);
      const ProjectBlogPost = getBlogPostModel(connection);
      const result = await ProjectBlogPost.updateOne({ id: parsed.data.id }, { $set: updates });
      if (result.matchedCount > 0) {
        const posts = await ProjectBlogPost.find({ id: parsed.data.id });
        return NextResponse.json({
          message: 'Post updated successfully',
          data: posts.map((post) => formatBlogPost(post.toObject())),
        });
      }
    }

    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const parsed = deletePostsSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const items: Array<{ id: string; projectId?: string }> =
      parsed.data.items?.length
        ? parsed.data.items
        : parsed.data.ids
          ? parsed.data.ids.map((id) => ({ id }))
          : [{ id: parsed.data.id as string }];

    const ids = items.map((item) => item.id);
    const projectGroups = items.reduce<Record<string, string[]>>((acc, item) => {
      const projectId = normalizeProjectId(item.projectId);
      if (!projectId) return acc;
      acc[projectId] = acc[projectId] ? [...acc[projectId], item.id] : [item.id];
      return acc;
    }, {});

    await connectToDB();
    await BlogPost.deleteMany({ id: { $in: ids } });

    const projects = await Project.find().lean<{ id: string; mongodbUri: string }[]>();
    const projectById = new Map(projects.map((project) => [project.id, project]));

    for (const [projectId, projectPostIds] of Object.entries(projectGroups)) {
      const project = projectById.get(projectId);
      if (!project) continue;
      if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
        continue;
      }
      const connection = await getProjectConnection(project.mongodbUri);
      const ProjectBlogPost = getBlogPostModel(connection);
      await ProjectBlogPost.deleteMany({ id: { $in: projectPostIds }, projectId });
    }

    if (Object.keys(projectGroups).length === 0) {
      for (const project of projects) {
        if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
          continue;
        }
        const connection = await getProjectConnection(project.mongodbUri);
        const ProjectBlogPost = getBlogPostModel(connection);
        await ProjectBlogPost.deleteMany({ id: { $in: ids } });
      }
    }

    return NextResponse.json({
      message: 'Posts deleted successfully',
      data: ids,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete posts' }, { status: 500 });
  }
}
