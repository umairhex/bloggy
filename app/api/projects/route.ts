import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { connectToDB } from '@/lib/db';
import Project from '@/models/Project.model';
import { formatProject, getProjects } from '@/lib/projects/server';
import {
  bulkUpdateProjectsSchema,
  createProjectSchema,
  deleteProjectsSchema,
  updateProjectSchema,
} from '@/lib/validations/project';

function validationError(error: unknown) {
  let message = 'The project payload is invalid.';
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

export async function GET() {
  try {
    const projects = await getProjects();

    return NextResponse.json({
      message: 'Projects fetched successfully',
      data: projects,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDB();

    const parsed = createProjectSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const project = await Project.create({
      id: parsed.data.id ?? `proj-${crypto.randomUUID()}`,
      name: parsed.data.name,
      description: parsed.data.description,
      mongodbUri: parsed.data.mongodbUri,
      category: parsed.data.category,
      isArchived: parsed.data.isArchived ?? false,
      connectionStatus: parsed.data.connectionStatus ?? 'untested',
    });

    return NextResponse.json(
      {
        message: 'Project created successfully',
        data: formatProject(project.toObject()),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();
    const parsed = Array.isArray(body.ids)
      ? bulkUpdateProjectsSchema.safeParse(body)
      : updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const projectIds = 'ids' in parsed.data ? parsed.data.ids : [parsed.data.id];

    await Project.updateMany({ id: { $in: projectIds } }, { $set: parsed.data.updates });

    const projects = await Project.find({ id: { $in: projectIds } }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      message: 'Projects updated successfully',
      data: projects.map((project) => formatProject(project.toObject())),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update projects' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDB();

    const parsed = deleteProjectsSchema.safeParse(await req.json());

    if (!parsed.success) {
      return validationError(parsed.error);
    }

    const projectIds = parsed.data.ids ?? [parsed.data.id as string];

    await Project.deleteMany({ id: { $in: projectIds } });

    return NextResponse.json({
      message: 'Projects deleted successfully',
      data: projectIds,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to delete projects' }, { status: 500 });
  }
}
