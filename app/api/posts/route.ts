import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { connectToDB, getProjectConnection, isLocalMongoUri } from '@/lib/db';
import BlogPost, { getBlogPostModel } from '@/models/BlogPost.model';
import Project from '@/models/Project.model';
import { formatBlogPost, getBlogPosts } from '@/lib/posts/server';
import { createPostSchema, deletePostsSchema, updatePostSchema } from '@/lib/validations/post';

function validationError(error: unknown) {
  let message = 'The post payload is invalid.';
  if (error instanceof ZodError) {
    message = error.issues
      .map((issue) => {
        const fieldName = issue.path.join('.');
        const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return `${capitalizedField}: ${issue.message}`;
      })
      .join(' | ');
  } else if (error instanceof Error) {
    message = error.message;
  }

  return NextResponse.json(
    {
      error: message,
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
    const postId = parsed.data.id ?? `post-${crypto.randomUUID()}`;

   
    await connectToDB();
    const mainPost = await BlogPost.create(
      normalizePostPayload({
        ...parsed.data,
        projectId: normalizedProjectId || undefined,
        id: postId,
      })
    );

   
    if (normalizedProjectId) {
      try {
        const projectModel = await getProjectBlogPostModel(normalizedProjectId);
        if (projectModel.model) {
          await projectModel.model.create(
            normalizePostPayload({
              ...parsed.data,
              projectId: normalizedProjectId,
              id: postId,
            })
          );
        }
      } catch (projectError) {
        console.warn(`Failed to mirror post in project ${normalizedProjectId} database:`, projectError);
      }
    }

    return NextResponse.json(
      {
        message: 'Post created successfully',
        data: formatBlogPost(mainPost.toObject()),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create post:', error);
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

   
    await connectToDB();
    const mainUpdate = await BlogPost.updateOne({ id: parsed.data.id }, { $set: updates });

    if (mainUpdate.matchedCount === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

   
    if (normalizedProjectId) {
      try {
        const projectModel = await getProjectBlogPostModel(normalizedProjectId);
        if (projectModel.model) {
          await projectModel.model.updateOne(
            { id: parsed.data.id },
            { $set: { ...updates, projectId: normalizedProjectId } },
            { upsert: true }
          );
        }
      } catch (projectError) {
        console.warn(`Failed to mirror post update in project ${normalizedProjectId} database:`, projectError);
      }
    }

   
    const posts = await BlogPost.find({ id: parsed.data.id });
    return NextResponse.json({
      message: 'Post updated successfully',
      data: posts.map((post) => formatBlogPost(post.toObject())),
    });
  } catch (error) {
    console.error('Failed to update post:', error);
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
      try {
        const connection = await getProjectConnection(project.mongodbUri);
        const ProjectBlogPost = getBlogPostModel(connection);
        await ProjectBlogPost.deleteMany({ id: { $in: projectPostIds }, projectId });
      } catch (projectError) {
        console.warn(`Failed to delete mirrored posts for project ${projectId}:`, projectError);
      }
    }

    if (Object.keys(projectGroups).length === 0) {
      for (const project of projects) {
        if (isLocalMongoUri(project.mongodbUri) && process.env.NODE_ENV === 'production') {
          continue;
        }
        try {
          const connection = await getProjectConnection(project.mongodbUri);
          const ProjectBlogPost = getBlogPostModel(connection);
          await ProjectBlogPost.deleteMany({ id: { $in: ids } });
        } catch (projectError) {
          console.warn(`Failed to delete mirrored posts for project fallback ${project.id}:`, projectError);
        }
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
