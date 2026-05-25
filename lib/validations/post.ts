import { z } from 'zod';

export const postStatusSchema = z.enum(['Published', 'Scheduled', 'Draft']);

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .default('')
  .refine((value) => !value || URL.canParse(value), {
    message: 'Enter a valid URL.',
  });

export const postFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(180),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use a lowercase URL slug.'),
  excerpt: z.string().trim().max(300).optional().default(''),
  content: z.string().trim().min(1, 'Content is required.'),
  status: postStatusSchema,
  publishDate: z.string().trim().optional().default(''),
  tags: z.array(z.string().trim().min(1)).default([]),
  featuredImageUrl: optionalUrlSchema,
  projectId: z.string().trim().optional().default(''),
  seoTitle: z.string().trim().max(70).optional().default(''),
  seoDescription: z.string().trim().max(160).optional().default(''),
});

export const createPostSchema = postFormSchema.extend({
  id: z.string().trim().min(1).optional(),
});

export const updatePostSchema = z.object({
  id: z.string().trim().min(1, 'Post id is required.'),
  updates: postFormSchema
    .partial()
    .extend({
      status: postStatusSchema.optional(),
    })
    .refine((updates) => Object.keys(updates).length > 0, {
      message: 'At least one update is required.',
    }),
});

export const deletePostsSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    ids: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((value) => Boolean(value.id || value.ids?.length), {
    message: 'At least one post id is required.',
  });

export type PostFormValues = z.infer<typeof postFormSchema>;
