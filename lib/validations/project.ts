import { z } from 'zod';

export const projectCategorySchema = z.enum(['production', 'staging', 'development']);

export const projectConnectionStatusSchema = z.enum(['untested', 'connected', 'failed']);

export const mongodbUriSchema = z
  .string()
  .trim()
  .min(1, 'MongoDB connection link is required.')
  .refine(
    (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    'Connection link must start with mongodb:// or mongodb+srv://'
  );

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required.').max(120),
  description: z.string().trim().max(500).optional().default(''),
  mongodbUri: mongodbUriSchema,
  category: projectCategorySchema,
});

export const createProjectSchema = projectFormSchema.extend({
  id: z.string().trim().min(1).optional(),
  isArchived: z.boolean().optional(),
  connectionStatus: projectConnectionStatusSchema.optional(),
});

export const updateProjectSchema = z.object({
  id: z.string().trim().min(1, 'Project id is required.'),
  updates: projectFormSchema
    .partial()
    .extend({
      isArchived: z.boolean().optional(),
      connectionStatus: projectConnectionStatusSchema.optional(),
    })
    .refine((updates) => Object.keys(updates).length > 0, {
      message: 'At least one update is required.',
    }),
});

export const bulkUpdateProjectsSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1),
  updates: projectFormSchema
    .partial()
    .extend({
      isArchived: z.boolean().optional(),
      connectionStatus: projectConnectionStatusSchema.optional(),
    })
    .refine((updates) => Object.keys(updates).length > 0, {
      message: 'At least one update is required.',
    }),
});

export const deleteProjectsSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    ids: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((value) => Boolean(value.id || value.ids?.length), {
    message: 'At least one project id is required.',
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
