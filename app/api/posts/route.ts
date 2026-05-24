import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import BlogPost from "@/models/BlogPost.model";
import { formatBlogPost, getBlogPosts } from "@/lib/posts/server";
import {
  createPostSchema,
  deletePostsSchema,
  updatePostSchema,
} from "@/lib/validations/post";

function validationError(error: unknown) {
  return NextResponse.json(
    {
      error:
        error instanceof Error ? error.message : "The post payload is invalid.",
    },
    { status: 400 }
  );
}

function normalizePostPayload<T extends { publishDate?: string; projectId?: string }>(
  payload: T
) {
  const normalized: Record<string, unknown> = { ...payload };

  if ("publishDate" in payload) {
    normalized.publishDate = payload.publishDate
      ? new Date(payload.publishDate)
      : null;
  }

  if ("projectId" in payload) {
    normalized.projectId = payload.projectId || null;
  }

  return normalized;
}

export async function GET() {
  try {
    const posts = await getBlogPosts();

    return NextResponse.json({
      message: "Posts fetched successfully",
      data: posts,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    const parsed = createPostSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const post = await BlogPost.create(
      normalizePostPayload({
        ...parsed.data,
        id: parsed.data.id ?? `post-${crypto.randomUUID()}`,
      })
    );

    return NextResponse.json(
      {
        message: "Post created successfully",
        data: formatBlogPost(post.toObject()),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();

    const parsed = updatePostSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    await BlogPost.updateOne(
      { id: parsed.data.id },
      { $set: normalizePostPayload(parsed.data.updates) }
    );

    const posts = await BlogPost.find({ id: parsed.data.id });

    return NextResponse.json({
      message: "Post updated successfully",
      data: posts.map((post) => formatBlogPost(post.toObject())),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();

    const parsed = deletePostsSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const postIds = parsed.data.ids ?? [parsed.data.id as string];

    await BlogPost.deleteMany({ id: { $in: postIds } });

    return NextResponse.json({
      message: "Posts deleted successfully",
      data: postIds,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete posts" },
      { status: 500 }
    );
  }
}
